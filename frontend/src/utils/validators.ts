export function required(value: any, label: string) {
  if (value === null || value === undefined || value === '') return `${label} is required`;
  return null;
}

export function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

