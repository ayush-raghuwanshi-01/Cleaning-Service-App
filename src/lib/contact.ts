import { normalizePhone } from "./validation";

/**
 * Contact link helpers. One place for the phone/WhatsApp URL formats so every
 * button in the app deep-links identically.
 */

const WA_BASE = "https://wa.me/";

/** `tel:` href from any phone format (10-digit, 91-prefixed, +91…). */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.startsWith("91") && digits.length === 12 ? digits : normalizePhone(digits)}`;
}

/** `https://wa.me/…` href with an optional pre-filled message. */
export function waHref(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const number = digits.length === 12 && digits.startsWith("91")
    ? digits
    : digits.length === 10 && /^[6-9]/.test(digits)
      ? `91${digits}`
      : digits;
  const suffix = message ? `?text=${encodeURIComponent(message)}` : "";
  return `${WA_BASE}${number}${suffix}`;
}
