"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import rw from "./locales/rw.json";
import fr from "./locales/fr.json";
import sw from "./locales/sw.json";

export const SUPPORTED_LOCALES = ["en", "rw", "fr", "sw"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  rw: "Kinyarwanda",
  fr: "Français",
  sw: "Kiswahili",
};

export const LOCALE_STORAGE_KEY = "rc_locale";

/**
 * i18next is initialised with a FIXED default of "en" so SSR and the first
 * client paint match (no hydration mismatch). The provider switches to the
 * stored/preferred language in an effect after mount.
 */
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      rw: { translation: rw },
      fr: { translation: fr },
      sw: { translation: sw },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export function isSupportedLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value) && (SUPPORTED_LOCALES as readonly string[]).includes(value as string);
}

export default i18n;
