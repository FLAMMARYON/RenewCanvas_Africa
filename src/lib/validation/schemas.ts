import { z } from "zod";

/**
 * Shared Zod validation schemas — used on BOTH the client (form UX) and the
 * server (authoritative validation) so the rules cannot drift apart.
 *
 * Keep these free of any server-only imports so client components can use them.
 */

/** Strips control characters, collapses whitespace, and trims. Use before DB writes. */
export function sanitizeText(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    out += code < 0x20 || code === 0x7f ? " " : ch;
  }
  return out.replace(/\s+/g, " ").trim();
}

const trimmed = (max: number) =>
  z.string().transform(sanitizeText).pipe(z.string().max(max));

const optionalTrimmed = (max: number) =>
  z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().max(max))
    .optional()
    .or(z.literal("").transform(() => undefined));

export const emailSchema = z
  .string()
  .transform((v) => v.trim().toLowerCase())
  .pipe(z.string().email("Enter a valid email address.").max(160));

/** Password policy mirrors src/lib/backend/auth.ts passwordIssues(). */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(200)
  .regex(/[A-Z]/, "Password needs an uppercase letter.")
  .regex(/[a-z]/, "Password needs a lowercase letter.")
  .regex(/[0-9]/, "Password needs a number.")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password needs a special character.");

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
  });
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;

/** Profile update — permissive superset across buyer/artist/admin roles. */
export const profileUpdateSchema = z
  .object({
    firstName: optionalTrimmed(80),
    lastName: optionalTrimmed(80),
    phone: optionalTrimmed(40),
    bio: optionalTrimmed(500),
    location: optionalTrimmed(120),
    website: optionalTrimmed(160),
    instagram: optionalTrimmed(80),
    twitter: optionalTrimmed(80),
    facebook: optionalTrimmed(120),
    title: optionalTrimmed(100),
    specialties: z.array(trimmed(80)).max(12).optional(),
    techniques: z.array(trimmed(80)).max(12).optional(),
    preferredMaterials: z.array(trimmed(80)).max(16).optional(),
    yearsExperience: z.number().int().min(0).max(80).optional(),
    payoutMethod: optionalTrimmed(80),
    payoutAccountName: optionalTrimmed(120),
    payoutAccountNumber: optionalTrimmed(80),
    payoutBankName: optionalTrimmed(120),
    notifications: z
      .object({
        orderUpdates: z.boolean().optional(),
        promotions: z.boolean().optional(),
        newArtworks: z.boolean().optional(),
        artistUpdates: z.boolean().optional(),
      })
      .optional(),
    address: z
      .object({
        line1: optionalTrimmed(160),
        line2: optionalTrimmed(160),
        city: optionalTrimmed(80),
        region: optionalTrimmed(80),
        postalCode: optionalTrimmed(40),
        country: optionalTrimmed(80),
      })
      .optional(),
  })
  .strict();
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/** Contact / multi-purpose inbound form. */
export const contactFormSchema = z.object({
  type: z.enum([
    "contact_form",
    "artist_application",
    "partnership_inquiry",
    "waste_supply_request",
    "commission_request",
    "donation_request",
    "booking_request",
    "cancellation_request",
    "newsletter_signup",
  ]),
  name: trimmed(120).pipe(z.string().min(2, "Name is required (min 2 characters).")),
  email: emailSchema,
  phone: optionalTrimmed(40),
  subject: optionalTrimmed(200),
  message: trimmed(5000).pipe(z.string().min(10, "Message is required (min 10 characters).")),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const newsletterSchema = z.object({
  email: emailSchema,
  name: optionalTrimmed(120),
});

/**
 * Helper that returns a flat field→message map from a Zod error, matching the
 * existing `{ errors: Record<string,string> }` API response shape.
 */
export function flattenZodError(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
