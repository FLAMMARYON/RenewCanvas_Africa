/**
 * i18n foundation.
 *
 * Supported languages for RenewCanvas Africa. Full-page machine translation is
 * provided by the GoogleTranslate widget; this module gives first-class,
 * curated strings + a BCP-47 mapping used by Web Speech narration and the
 * artwork-description API.
 */

export const SUPPORTED_LOCALES = ["en", "rw", "fr", "sw"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  rw: "Kinyarwanda",
  fr: "Français",
  sw: "Kiswahili",
};

/** BCP-47 tags for Web Speech API (speechSynthesis) voice selection. */
export const LOCALE_BCP47: Record<Locale, string> = {
  en: "en-US",
  rw: "rw-RW",
  fr: "fr-FR",
  sw: "sw-KE",
};

export const LOCALE_COOKIE = "rc_locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value) && (SUPPORTED_LOCALES as readonly string[]).includes(value as string);
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
