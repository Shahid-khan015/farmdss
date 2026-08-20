/**
 * Threshold bands that exist in the DSS specification.
 *
 * These are used *only* to colour and annotate the result visualisations. They are
 * not used to generate any advisory text: warnings, recommendations, `status` and
 * `confidence` all come from the backend verbatim, because the thresholds behind
 * them live in `engineering_validation.py` and must not be duplicated here.
 *
 * Every constant below is traceable to `docs/SIMULATION_ENGINE_FORMULAS.md`.
 */

import type { StatusTone } from '../theme/palette';

/** DSS "Check Put value" table (A13, DSS-EXACT). */
export const PUT_PROPERLY_LOADED = { min: 95, max: 100 } as const;

/** Rear-ballast target slip (A11, DSS-EXACT) and the engine's iteration cap (A8, assumption). */
export const SLIP_BALLAST_TARGET_PCT = 15;
export const SLIP_ENGINE_CAP_PCT = 20;

/** Minimum front-axle weight utilisation Kwef = Rf/Wt (A11, DSS-EXACT). */
export const KWEF_MINIMUM = 0.2;

/** Operating-input ranges enforced by the backend before the engine runs. */
export const INPUT_RANGES = {
  speed: { min: 2, max: 8, unit: 'km/h' },
  depth: { min: 5, max: 35, unit: 'cm' },
  cone_index: { min: 300, max: 3000, unit: 'kPa' },
  implement_width: { min: 0.5, max: 5, unit: 'm' },
  pto_power: { min: 10, exclusiveMin: true, unit: 'kW' },
} as const;

/** DSS-defined ranges for the two combi inputs. */
export const KI_RANGE = { min: 0, max: 0.25 } as const;
export const ROTOR_EFFICIENCY_RANGE = { min: 0.25, max: 0.45 } as const;

/**
 * Tone for power utilisation against the DSS load table.
 * Under-loaded is `caution` rather than `critical` — it wastes capacity but is safe.
 */
export function powerUtilizationTone(percent: number | null | undefined): StatusTone {
  if (percent == null) return 'neutral';
  if (percent > PUT_PROPERLY_LOADED.max) return 'critical';
  if (percent < PUT_PROPERLY_LOADED.min) return 'caution';
  return 'ok';
}

/** Tone for wheel slip against the 15% ballast target and the 20% cap. */
export function slipTone(percent: number | null | undefined): StatusTone {
  if (percent == null) return 'neutral';
  if (percent >= SLIP_ENGINE_CAP_PCT) return 'critical';
  if (percent > SLIP_BALLAST_TARGET_PCT) return 'caution';
  return 'ok';
}

/** Tone for front-axle weight utilisation against the 0.20 steering minimum. */
export function kwefTone(ratio: number | null | undefined): StatusTone {
  if (ratio == null) return 'neutral';
  return ratio < KWEF_MINIMUM ? 'caution' : 'ok';
}

/** Tone for the backend's own overall status label. */
export function statusTone(status: string | null | undefined): StatusTone {
  switch (status) {
    case 'Stable':
      return 'ok';
    case 'Heavy Load':
      return 'caution';
    case 'Unstable':
    case 'Not Recommended':
      return 'critical';
    default:
      return 'neutral';
  }
}

/** Tone for the backend's confidence label. */
export function confidenceTone(confidence: string | null | undefined): StatusTone {
  switch (confidence) {
    case 'High':
      return 'ok';
    case 'Moderate':
      return 'caution';
    case 'Low':
      return 'critical';
    default:
      return 'neutral';
  }
}

/** Tone for a DSS load-status string from the Put table. */
export function loadStatusTone(loadStatus: string | null | undefined): StatusTone {
  if (!loadStatus) return 'neutral';
  if (loadStatus.includes('properly loaded')) return 'ok';
  if (loadStatus.includes('Overloaded')) return 'critical';
  if (loadStatus.includes('Underloaded')) return 'caution';
  return 'neutral';
}

/**
 * Classify a backend warning string by severity so the UI can rank them.
 * Matches on the engine's own phrasing; unmatched warnings default to `caution`,
 * never dropped.
 */
export function warningTone(warning: string): StatusTone {
  const text = warning.toLowerCase();
  if (text.includes('non-physical') || text.includes('cannot be reached')) return 'critical';
  if (text.includes('20%') || text.includes('engineering limit')) return 'critical';
  if (text.includes('not required')) return 'info';
  return 'caution';
}
