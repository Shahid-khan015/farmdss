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

