const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const FINNISH_POSTAL_CODE_PATTERN = /^[0-9]{5}$/;

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim()) && value.length <= 254;
}

export function isFinnishPostalCode(value: string): boolean {
  return FINNISH_POSTAL_CODE_PATTERN.test(value.trim());
}

export function normaliseFinnishPostalCode(value: string): string | null {
  const digits = value.replace(/\s+/g, "").trim();
  return isFinnishPostalCode(digits) ? digits : null;
}
