export function required(value: any, label: string) {
  if (value === null || value === undefined || value === '') return `${label} is required`;
  return null;
}

export function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateOptionalEmail(email: string): string | null {
  const t = email.trim();
  if (!t) return null;
  if (!EMAIL_RE.test(t)) return 'Enter a valid email address.';
  return null;
}

/** 10-digit local mobile (digits only; length is the only client-side rule). */
export function validateIndianMobileLocal(digits: string): string | null {
  if (!digits) return 'Phone number is required.';
  if (digits.length !== 10) return 'Phone number must be exactly 10 digits.';
  if (!/^\d{10}$/.test(digits)) return 'Phone number must contain only digits.';
  return null;
}

/** GSTIN when provided (15 chars, standard pattern). */
export function validateOptionalGst(gst: string): string | null {
  const t = gst.trim().toUpperCase();
  if (!t) return null;
  if (t.length !== 15) return 'GST number must be 15 characters.';
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][A-Z][0-9A-Z]$/.test(t)) {
    return 'Enter a valid GST number (e.g. 22AAAAA0000A1Z5).';
  }
  return null;
}

export function validateOptionalMinLength(
  value: string,
  label: string,
  min: number,
): string | null {
  const t = value.trim();
  if (!t) return null;
  if (t.length < min) return `${label} must be at least ${min} characters.`;
  return null;
}

export function validateOptionalPositiveDecimal(
  value: string,
  label: string,
): string | null {
  const t = value.trim();
  if (!t) return null;
  const n = Number(t.replace(',', '.'));
  if (!Number.isFinite(n) || n <= 0) return `${label} must be a positive number.`;
  if (n > 1_000_000) return `${label} is too large.`;
  return null;
}

export function validateOptionalNonNegativeInteger(
  value: string,
  label: string,
  max: number,
): string | null {
  const t = value.trim();
  if (!t) return null;
  if (!/^\d+$/.test(t)) return `${label} must be a whole number.`;
  const n = Number(t);
  if (n > max) return `${label} cannot exceed ${max}.`;
  return null;
}

