/**
 * Formatting for physical quantities.
 *
 * One definition per quantity so units and precision are identical everywhere and
 * never re-decided per screen. These functions format numbers the backend produced;
 * they never convert between unit systems and never derive new values — the only
 * scaling applied is N → kN, which is a pure display choice on a single quantity.
 */

/** Placeholder shown wherever the engine did not report a value. Never a zero or a guess. */
export const NOT_REPORTED = '—';

export type Quantity =
  | 'draft'
  | 'force'
  | 'power'
  | 'percent'
  | 'ratio'
  | 'mass'
  | 'fieldCapacity'
  | 'fuelPerArea'
  | 'fuelPerHour'
  | 'specificFuel'
  | 'coneIndex'
  | 'torque'
  | 'speed'
  | 'depth'
  | 'length'
  | 'area'
  | 'hours'
  | 'rpm'
  | 'dimensionless';

type QuantitySpec = { unit: string; decimals: number; scale?: number };

const SPEC: Record<Quantity, QuantitySpec> = {
  /** Draft is reported in N by the engine; shown in kN for readability. */
  draft: { unit: 'kN', decimals: 2, scale: 1 / 1000 },
  force: { unit: 'N', decimals: 0 },
  power: { unit: 'kW', decimals: 2 },
  percent: { unit: '%', decimals: 1 },
  ratio: { unit: '', decimals: 3 },
  mass: { unit: 'kg', decimals: 1 },
  fieldCapacity: { unit: 'ha/h', decimals: 2 },
  fuelPerArea: { unit: 'L/ha', decimals: 2 },
  fuelPerHour: { unit: 'L/h', decimals: 2 },
  specificFuel: { unit: 'L/kW·h', decimals: 3 },
  coneIndex: { unit: 'kPa', decimals: 0 },
  torque: { unit: 'N·m', decimals: 1 },
  speed: { unit: 'km/h', decimals: 1 },
  depth: { unit: 'cm', decimals: 1 },
  length: { unit: 'm', decimals: 2 },
  area: { unit: 'ha', decimals: 2 },
  hours: { unit: 'h', decimals: 2 },
  rpm: { unit: 'rpm', decimals: 0 },
  dimensionless: { unit: '', decimals: 2 },
};

export function unitOf(quantity: Quantity): string {
  return SPEC[quantity].unit;
}

function toFinite(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Numeric value in display units (applies the N → kN scale for `draft`). */
export function displayValue(value: unknown, quantity: Quantity): number | null {
  const n = toFinite(value);
  if (n === null) return null;
  const { scale } = SPEC[quantity];
  return scale ? n * scale : n;
}

/** Formatted number only, without the unit. Returns `—` when not reported. */
export function formatNumber(value: unknown, quantity: Quantity): string {
  const n = displayValue(value, quantity);
  if (n === null) return NOT_REPORTED;
  return n.toLocaleString(undefined, {
    minimumFractionDigits: SPEC[quantity].decimals,
    maximumFractionDigits: SPEC[quantity].decimals,
  });
}

/** Formatted number with its unit, e.g. `1.35 kN`. */
export function formatQuantity(value: unknown, quantity: Quantity): string {
  const text = formatNumber(value, quantity);
  if (text === NOT_REPORTED) return NOT_REPORTED;
  const unit = SPEC[quantity].unit;
  return unit ? `${text} ${unit}` : text;
}

/**
 * Screen-reader phrasing, e.g. "Slip, 14.6 percent".
 * Units are spelled out because abbreviations are read poorly.
 */
const SPOKEN_UNIT: Partial<Record<Quantity, string>> = {
  draft: 'kilonewtons',
  force: 'newtons',
  power: 'kilowatts',
  percent: 'percent',
  mass: 'kilograms',
  fieldCapacity: 'hectares per hour',
  fuelPerArea: 'litres per hectare',
  fuelPerHour: 'litres per hour',
  specificFuel: 'litres per kilowatt hour',
  coneIndex: 'kilopascals',
  torque: 'newton metres',
  speed: 'kilometres per hour',
  depth: 'centimetres',
  length: 'metres',
  area: 'hectares',
  hours: 'hours',
  rpm: 'revolutions per minute',
};

export function accessibleQuantity(label: string, value: unknown, quantity: Quantity): string {
  const text = formatNumber(value, quantity);
  if (text === NOT_REPORTED) return `${label}, not reported`;
  const spoken = SPOKEN_UNIT[quantity];
  return spoken ? `${label}, ${text} ${spoken}` : `${label}, ${text}`;
}
