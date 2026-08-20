/**
 * App-wide configuration.
 *
 * The API base URL defaults to an empty string so requests hit the Vite dev
 * proxy (`/api` → backend). Override with `VITE_API_URL` for production.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

/**
 * Google OAuth client ID for "Sign in with Google". Must match the audience of
 * the ID token, and the backend's GOOGLE_CLIENT_ID must equal this value.
 */
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

/**
 * Public business information. Keep production values in `.env` so the UI never
 * needs hard-coded demo contact details or city-specific claims.
 */
export const BRAND_NAME = import.meta.env.VITE_BRAND_NAME || "Home Shine";
export const BRAND_CITY = import.meta.env.VITE_BRAND_CITY || "Bhopal";
export const BRAND_REGION = import.meta.env.VITE_BRAND_REGION || "Madhya Pradesh";
export const BUSINESS_EMAIL = import.meta.env.VITE_BUSINESS_EMAIL || "ayushtechguide@gmail.com";

/** Phone/WhatsApp in international digits only, e.g. 919876543210. */
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "919827206839";
export const SUPPORT_PHONE = import.meta.env.VITE_SUPPORT_PHONE || "919584559972";

/** Optional comma-separated fallback service area labels for empty API state. */
export const FALLBACK_SERVICE_AREAS = String(import.meta.env.VITE_SERVICE_AREAS || "MP Nagar, Minal, JK Road, Avadhpuri, Indrapuri, Patel Nagar, Ayodhya By Pass, Ayodhya Nagar, Ashoka Garden")
  .split(",")
  .map((area) => area.trim())
  .filter(Boolean);

export const BRAND_LOCATION = [BRAND_CITY, BRAND_REGION].filter(Boolean).join(", ");

export function formatPhone(number = SUPPORT_PHONE): string {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "Contact us";
  if (digits.startsWith("91") && digits.length === 12) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

export const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
] as const;
