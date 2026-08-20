/**
 * Typed normalisation of backend errors.
 *
 * The DSS backend returns three structurally different 422 bodies, and the UI needs
 * to react differently to each. Flattening them into one string (as the previous
 * interceptor did) makes inline field errors and the non-convergence explainer
 * impossible, so the shape is preserved here instead.
 *
 *  1. Operating-range failure  — `detail: { status: 'validation_failed', errors: [...] }`
 *     Raised by `validate_operating_ranges`; each entry carries the authoritative
 *     min/max/unit, so the UI never has to hardcode a copy of the bounds.
 *  2. Request-schema failure   — `detail: [{ loc, msg, type }]`
 *     FastAPI/Pydantic. `loc` is mapped back onto a form field name.
 *  3. Engine diagnostic        — `detail: "<long DSS explanation>"`
 *     A `ValueError` from the simulation engine (e.g. the Section 4 `Bn'` blocker).
 *     These are deliberately long and explanatory and must be shown as prose.
 */

import { isAxiosError } from 'axios';

/** A single field-scoped problem, from either validation shape. */
export type ApiFieldError = {
  /** Backend field name, e.g. `speed`, `cone_index`, `implement_width`. */
  field: string;
  code: string;
  message: string;
  value?: number | null;
  /** Authoritative bounds, when the backend supplied them. */
  range?: {
    min?: number;
    max?: number;
    exclusive_min?: boolean;
    unit?: string;
  };
};

export type ApiError =
  /** Operating-range validation: render inline against the offending inputs. */
  | { kind: 'field_validation'; status: number; errors: ApiFieldError[]; message: string }
  /** Request-schema validation: same treatment, different source shape. */
  | { kind: 'request_validation'; status: number; errors: ApiFieldError[]; message: string }
  /** Engine refused to produce a result and explained why. Show as prose, not a toast. */
  | { kind: 'engine_diagnostic'; status: number; detail: string; message: string }
  | { kind: 'not_found'; status: number; message: string }
  | { kind: 'auth'; status: number; message: string }
  | { kind: 'forbidden'; status: number; message: string }
  | { kind: 'conflict'; status: number; message: string }
  | { kind: 'server'; status: number; message: string }
  | { kind: 'timeout'; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'unknown'; message: string };

/**
 * Error object actually thrown by the axios interceptor.
 *
 * Extends `Error` so existing `catch (e) { e.message }` call sites keep working,
 * while `.api` carries the structure new code needs.
 */
export class NormalizedApiError extends Error {
  readonly api: ApiError;

  constructor(api: ApiError) {
    super(api.message);
    this.name = 'NormalizedApiError';
    this.api = api;
  }
}

/** Narrowing helper for `unknown` caught values. */
export function isApiError(error: unknown): error is NormalizedApiError {
  return error instanceof NormalizedApiError;
}

/**
 * Extract the structured error from any caught value, falling back to a plain
 * `unknown` wrapper so consumers can always render something meaningful.
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error.api;
  if (error instanceof Error) return { kind: 'unknown', message: error.message };
  return { kind: 'unknown', message: 'Something went wrong.' };
}

/** True when retrying the identical request could plausibly succeed. */
export function isRecoverable(error: ApiError): boolean {
  return error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server';
}

/** Field errors if this error has any, else an empty array. */
export function fieldErrorsOf(error: ApiError): ApiFieldError[] {
  return error.kind === 'field_validation' || error.kind === 'request_validation'
    ? error.errors
    : [];
}

/** Look up the first message for a given backend field name. */
export function messageForField(error: ApiError, field: string): string | undefined {
  return fieldErrorsOf(error).find((e) => e.field === field)?.message;
}

/**
 * Human-readable bounds for a field error, e.g. "2–8 km/h" or "> 10 kW".
 * Uses only what the backend sent; returns undefined when it sent no range.
 */
export function describeRange(fieldError: ApiFieldError): string | undefined {
  const range = fieldError.range;
  if (!range) return undefined;
  const unit = range.unit ? ` ${range.unit}` : '';
  if (range.min != null && range.max != null) return `${range.min}–${range.max}${unit}`;
  if (range.min != null) return `${range.exclusive_min ? '>' : '≥'} ${range.min}${unit}`;
  if (range.max != null) return `≤ ${range.max}${unit}`;
  return undefined;
}

// --- Parsing -----------------------------------------------------------------

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** `{ status: 'validation_failed', errors: [...] }` from validate_operating_ranges. */
function parseRangeValidation(detail: unknown): ApiFieldError[] | null {
  if (!isRecord(detail)) return null;
  if (detail.status !== 'validation_failed') return null;
  if (!Array.isArray(detail.errors)) return null;

  return detail.errors.filter(isRecord).map((entry): ApiFieldError => {
    const range = isRecord(entry.range) ? entry.range : undefined;
    return {
      field: String(entry.field ?? 'unknown'),
      code: String(entry.code ?? 'invalid'),
      message: String(entry.message ?? 'Invalid value.'),
      value: asNumber(entry.value) ?? null,
      range: range
        ? {
            min: asNumber(range.min),
            max: asNumber(range.max),
            exclusive_min: range.exclusive_min === true,
            unit: typeof range.unit === 'string' ? range.unit : undefined,
          }
        : undefined,
    };
  });
}

/**
 * Pydantic `[{ loc, msg, type }]`.
 *
 * `loc` is like `['body', 'speed']`; the last string segment is the field. Whole-body
 * errors (the `model_validator` messages such as "Rotor fields required for
 * combination_type=active_passive") have `loc: ['body']`, so they surface under the
 * synthetic field `__request__`.
 */
function parseRequestValidation(detail: unknown): ApiFieldError[] | null {
  if (!Array.isArray(detail)) return null;

  return detail.filter(isRecord).map((entry): ApiFieldError => {
    const loc = Array.isArray(entry.loc) ? entry.loc : [];
    const segments = loc.filter((s): s is string => typeof s === 'string' && s !== 'body');
    return {
      field: segments.length > 0 ? segments[segments.length - 1] : '__request__',
      code: String(entry.type ?? 'invalid'),
      message: String(entry.msg ?? 'Invalid value.'),
    };
  });
}

/**
 * Engine diagnostics are long, sentence-form and explanatory; ordinary 4xx details
 * are short labels like "Tractor not found". Only the former deserves the
 * full-screen explainer treatment.
 */
function looksLikeEngineDiagnostic(detail: string): boolean {
  return detail.length > 120 || /\b(DSS|Bn'|converge|non-physical|coefficient of traction)\b/i.test(detail);
}

const GENERIC_MESSAGE: Record<number, string> = {
  400: 'The request was rejected.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to do that.',
  404: 'Not found.',
  409: 'That conflicts with existing data.',
  500: 'The server hit an unexpected error.',
  502: 'The server is unreachable right now.',
  503: 'The service is temporarily unavailable.',
  504: 'The server took too long to respond.',
};

function summarise(errors: ApiFieldError[], fallback: string): string {
  if (errors.length === 0) return fallback;
  if (errors.length === 1) return errors[0].message;
  return `${errors.length} fields need attention.`;
}

/** Convert any thrown axios/JS value into the discriminated union. */
export function normalizeError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    if (error instanceof Error) return { kind: 'unknown', message: error.message };
    return { kind: 'unknown', message: 'Something went wrong.' };
  }

  if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
    return {
      kind: 'timeout',
      message: 'The request timed out. The server may be busy — try again.',
    };
  }

  if (!error.response) {
    return {
      kind: 'network',
      message: 'Could not reach the server. Check your connection and try again.',
    };
  }

  const status = error.response.status;
  const detail = isRecord(error.response.data) ? error.response.data.detail : undefined;
  const generic = GENERIC_MESSAGE[status] ?? `Request failed (${status}).`;

  const rangeErrors = parseRangeValidation(detail);
  if (rangeErrors && rangeErrors.length > 0) {
    return {
      kind: 'field_validation',
      status,
      errors: rangeErrors,
      message: summarise(rangeErrors, generic),
    };
  }

  const schemaErrors = parseRequestValidation(detail);
  if (schemaErrors && schemaErrors.length > 0) {
    return {
      kind: 'request_validation',
      status,
      errors: schemaErrors,
      message: summarise(schemaErrors, generic),
    };
  }

  if (typeof detail === 'string' && detail.trim().length > 0) {
    const text = detail.trim();
    if (status === 422 && looksLikeEngineDiagnostic(text)) {
      return { kind: 'engine_diagnostic', status, detail: text, message: text };
    }
    if (status === 404) return { kind: 'not_found', status, message: text };
    if (status === 401) return { kind: 'auth', status, message: text };
    if (status === 403) return { kind: 'forbidden', status, message: text };
    if (status === 409) return { kind: 'conflict', status, message: text };
    if (status >= 500) return { kind: 'server', status, message: text };
    return { kind: 'unknown', message: text };
  }

  if (status === 401) return { kind: 'auth', status, message: generic };
  if (status === 403) return { kind: 'forbidden', status, message: generic };
  if (status === 404) return { kind: 'not_found', status, message: generic };
  if (status === 409) return { kind: 'conflict', status, message: generic };
  if (status >= 500) return { kind: 'server', status, message: generic };
  return { kind: 'unknown', message: generic };
}
