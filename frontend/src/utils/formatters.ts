export function fmtNum(value?: number | null, digits = 2) {
  if (value === null || value === undefined) return '-';
  const n = Number(value);
  if (!Number.isFinite(n)) return '-';
  return n.toFixed(digits);
}

export function fmtAreaHa(value?: number | null, fallback = '--') {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return `${n.toFixed(4)} ha`;
}


/**
 * The one rupee formatter. Always two decimals, always grouped `en-IN`.
 *
 * Money used to be rendered four different ways across the app -- `₹ 1,234.56`,
 * `₹1234.56`, `Rs 1234.56` -- and the summary screen additionally stripped a trailing
 * `.00`, so the same charge appeared in different shapes on different screens.
 */
export function fmtCurrencyInr(value?: number | null | string, fallback = '--'): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n === null || n === undefined || !Number.isFinite(n)) return fallback;
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Hours, as billed for Threshing/Grading. */
export function fmtHours(value?: number | null, fallback = '--'): string {
  if (value === null || value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return `${n.toFixed(2)} h`;
}
