/**
 * App-wide configuration.
 *
 * The API base URL defaults to an empty string so requests hit the Vite dev
 * proxy (`/api` → backend). Override with `VITE_API_URL` for production.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export const BRAND_NAME = "SparkleHome";

export const WHATSAPP_NUMBER = "919876543210";

/** Bhopal service area pincode prefix used for address validation. */
export const BHOPAL_PINCODE_PREFIX = "462";

export const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
] as const;
