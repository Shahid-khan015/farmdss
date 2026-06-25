/** Raw input → up to 10 digits for the Indian local mobile (strips country code 91 when pasted). */
export function extractIndianLocalDigits(value: string): string {
  let digits = value.trim().replace(/\D/g, '');
  while (digits.length > 10 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 10);
}

export function normalizeIndianPhone(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('+') && !trimmed.startsWith('+91')) {
    return trimmed;
  }

  const localDigits = extractIndianLocalDigits(trimmed.startsWith('+') ? trimmed.slice(1) : trimmed);
  if (!localDigits) return '';

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
