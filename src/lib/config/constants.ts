/**
 * Central application constants.
 *
 * SUPPORT_EMAIL is the public-facing address shown in UI, legal pages, and
 * footers. It is safe to render to the browser.
 *
 * getSupportInboxEmail() returns the *delivery* inbox used by server-side email
 * routing. It reads the server-only SUPPORT_INBOX_EMAIL env var and falls back
 * to the public address when unset. Never import this into client components.
 */

/** Public, display-only support address. Safe for the browser. */
export const SUPPORT_EMAIL = "hello.renewcanvas@gmail.com";

/** Public brand details. */
export const BRAND = {
  name: "RenewCanvas Africa",
  tagline: "Anything is art in the right eyes",
  supportEmail: SUPPORT_EMAIL,
} as const;

/**
 * Server-side support inbox for email delivery. Reads SUPPORT_INBOX_EMAIL
 * (server-only env var); falls back to the public support address.
 *
 * Do NOT call this from client components — it touches process.env.
 */
export function getSupportInboxEmail(): string {
  const fromEnv = process.env.SUPPORT_INBOX_EMAIL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : SUPPORT_EMAIL;
}
