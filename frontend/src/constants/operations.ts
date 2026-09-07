/**
 * Operation types and how each one is billed.
 *
 * The 7-operation list and the "Threshing/Grading are per hour" rule used to be restated
 * in five screens. One of those copies matched Title-Case names case-sensitively while the
 * rest lower-cased, so the same operation could be shown a per-hectare rate editor while
 * the backend billed it per hour. This module is the client-side mirror of
 * `backend/app/core/billing_units.py`; nothing else should hard-code the rule.
 *
 * For a session that has already started, prefer the server's `charge_unit` field over
 * `isPerHourOperation(...)` -- the unit is locked onto the session at start, and the stored
 * value is authoritative.
 */

export const OPERATION_TYPES = [
  'Tillage',
  'Sowing',
  'Spraying',
  'Weeding',
  'Harvesting',
  'Threshing',
  'Grading',
] as const;

export type OperationType = (typeof OPERATION_TYPES)[number];

/** Values of `charge_unit` as persisted on a session. */
export type ChargeUnit = 'per_ha' | 'per_hour';

const PER_HOUR_OPERATIONS = new Set(['threshing', 'grading']);

export function normalizeOperationType(operationType?: string | null): string {
  return (operationType ?? '').trim().toLowerCase();
}

export function isPerHourOperation(operationType?: string | null): boolean {
  return PER_HOUR_OPERATIONS.has(normalizeOperationType(operationType));
}

export function chargeUnitFor(operationType?: string | null): ChargeUnit {
  return isPerHourOperation(operationType) ? 'per_hour' : 'per_ha';
}

/** `/hr` or `/ha` for a rate label. Prefers the session's locked unit when given one. */
export function unitSuffix(chargeUnit?: string | null, operationType?: string | null): string {
  const unit = chargeUnit ?? chargeUnitFor(operationType);
  return unit === 'per_hour' ? 'hr' : 'ha';
}
