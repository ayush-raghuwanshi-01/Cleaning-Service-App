import { z } from "zod";
import { todayISO } from "./format";

/**
 * Shared form-validation schemas (zod). Used by the booking widget, auth
 * forms and admin forms so the client validates exactly what the FastAPI
 * backend's Pydantic schemas expect.
 */

/** Indian mobile: 10 digits starting 6-9, or with +91 / 91 prefix. */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91[6-9]\d{9}|91[6-9]\d{9}|[6-9]\d{9})$/, "Enter a valid 10-digit Indian mobile number");

/** Normalize any accepted mobile input to E.164-ish `91XXXXXXXXXX`. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return digits;
}

/** Bhopal postal district: 46xxxx, or any pincode served by an active area. */
export const pincodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Enter a valid 6-digit pincode");

export const BHOPAL_PINCODE_PREFIX = "46";

export function isBhopalPincode(pincode: string): boolean {
  return pincode.startsWith(BHOPAL_PINCODE_PREFIX);
}

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(120, "Name is too long");

/**
 * Password rules mirrored from the backend: min 12 chars.
 * Hint text guides users instead of raw complexity rules (MVP).
 */
export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password is too long");

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your phone or email"),
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z.object({
  full_name: fullNameSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export const bookingAddressSchema = z.object({
  street: z.string().trim().min(3, "Enter your house / flat / street").max(255),
  area: z.string().trim().min(2, "Enter your area / locality").max(120),
  pincode: pincodeSchema,
  floor: z.string().trim().max(60).optional(),
  landmark: z.string().trim().max(160).optional(),
  description: z.string().trim().max(4000).optional(),
});

export type BookingAddressValues = z.infer<typeof bookingAddressSchema>;

/** Bookings can be placed between today and 90 days out. */
export const MAX_BOOKING_DAYS_AHEAD = 90;

export function maxBookingDateISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + MAX_BOOKING_DAYS_AHEAD);
  const offsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Valid booking date: today ≤ date ≤ +90 days, ISO format. */
export const bookingDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date")
  .refine((v) => v >= todayISO(), "Pick today or a future date")
  .refine((v) => v <= maxBookingDateISO(), "Bookings open up to 90 days ahead");

/**
 * Parse a money string from an <input type="number"> into a safe positive
 * integer-rupee amount. Returns null when the input isn't a usable amount
 * (empty, NaN, zero, negative or absurdly large).
 */
export function parseAmount(value: string, max = 1_000_000): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0 || num > max) return null;
  return Math.round(num);
}

/** Positive quantity (≥1) from a string input, else fallback of 1. */
export function parseQuantity(value: string, max = 20): number {
  const num = Number(value.trim());
  if (!Number.isFinite(num) || num < 1) return 1;
  return Math.min(Math.floor(num), max);
}

/** Offline (admin) order intake — taken from a call or WhatsApp chat. */
export const adminOrderSchema = z.object({
  customer_name: fullNameSchema,
  customer_phone: phoneSchema,
  service_id: z.string().min(1, "Choose a service"),
  scheduled_date: bookingDateSchema,
  scheduled_slot: z.string().min(1, "Choose a time slot"),
  street: z.string().trim().min(3, "Enter the house / flat / street").max(255),
  area: z.string().trim().min(2, "Enter the area / locality").max(120),
  pincode: pincodeSchema,
});

export const staffSchema = z.object({
  full_name: fullNameSchema,
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  specializations: z.string().trim().max(160).optional(),
});

export const whatsappSettingsSchema = z.object({
  support_number: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Enter the number in international digits, e.g. 919876543210"),
  staff_group_link: z
    .string()
    .trim()
    .url("Paste a full link starting with https://")
    .optional()
    .or(z.literal("")),
});

/** Turn a zod error into a `{ field: message }` map for inline field errors. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
