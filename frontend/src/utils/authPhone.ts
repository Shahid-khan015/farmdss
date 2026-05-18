export function normalizeIndianPhone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('+')) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  const localDigits = digits.startsWith('91') && digits.length > 10
    ? digits.slice(2)
    : digits;

  return `+91${localDigits}`;
}

export function stripIndianCountryCode(value: string | undefined): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('+91')) {
    return trimmed.slice(3);
  }
  return trimmed.replace(/^\+/, '');
}
