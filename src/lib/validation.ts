import { z } from "zod";

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

/** Turn a zod error into a `{ field: message }` map for inline field errors. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
