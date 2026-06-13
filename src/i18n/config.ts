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

/**
 * Apply a locale everywhere, from one place (shared by the navbar switcher and
 * the settings page so the logic isn't duplicated):
 *  1. switch the live i18next language (translates the whole site from the JSON
 *     locale files),
 *  2. remember it locally (localStorage + cookie) for anonymous users / reloads,
 *  3. persist it to the database for the signed-in user (fire-and-forget; a
 *     logged-out user simply gets a 401 which we ignore).
 */
export function applyLocale(locale: AppLocale): void {
  i18n.changeLanguage(locale);
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore storage errors */
  }
  document.cookie = `${LOCALE_STORAGE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  void fetch("/api/profile/language", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ language: locale }),
  }).catch(() => {
    /* anonymous users have no DB row to update; ignore */
  });
}

export default i18n;
