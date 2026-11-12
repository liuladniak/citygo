// Cleans a typed chat message before it is stored. Not a perfect PII filter
// (a name typed in a sentence stays); the table is private and short-lived.

export const MAX_TEXT = 200;

const EMAIL = /[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+/g;
// 7+ digits, optionally split by spaces, dots, dashes or brackets (phone, card, booking-like numbers)
const LONG_NUMBER = /\+?\d(?:[\s().-]{0,2}\d){6,}/g;

export const redact = (input: unknown): string => {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(EMAIL, "[email]")
    .replace(LONG_NUMBER, "[number]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT);
};
