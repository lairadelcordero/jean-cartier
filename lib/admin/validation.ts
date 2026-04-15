const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-.\s\d]{6,25}$/;
const AR_CUIT_RE = /^\d{2}-?\d{8}-?\d{1}$/;

export function normalizeRutCuit(input: string) {
  return input.replace(/\s+/g, "").trim();
}

export function isValidRutCuit(input: string) {
  const value = normalizeRutCuit(input);
  return AR_CUIT_RE.test(value);
}

export function isValidEmail(input: string) {
  return EMAIL_RE.test(input.trim());
}

export function isValidPhone(input: string) {
  return PHONE_RE.test(input.trim());
}

export function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value));
}

export function assertDateOrder(earlier: string, later: string) {
  if (!isIsoDate(earlier) || !isIsoDate(later)) return false;
  return new Date(later).getTime() > new Date(earlier).getTime();
}

export function inEnum<T extends readonly string[]>(value: string, values: T): value is T[number] {
  return values.includes(value);
}
