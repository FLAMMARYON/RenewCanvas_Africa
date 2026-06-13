"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n, { isSupportedLocale, LOCALE_STORAGE_KEY } from "@/i18n/config";

/**
 * Wraps the app so every client component can use react-i18next.
 *
 * To avoid hydration mismatch, i18next starts in "en" (matching SSR + first
 * paint). After mount we switch to the saved preference, or the browser
 * language, defaulting to English. The choice persists in localStorage + a
 * cookie so it applies site-wide and across reloads.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let active = true;

    // 1. Apply the locally-remembered (or browser) preference immediately so the
    //    UI doesn't flash English for returning visitors.
    let preferred: string | null = null;
    try {
      preferred = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    } catch {
      preferred = null;
    }
    if (!isSupportedLocale(preferred)) {
      const browser = navigator.language?.slice(0, 2);
      preferred = isSupportedLocale(browser) ? browser : "en";
    }
    if (preferred && preferred !== i18n.language) {
      i18n.changeLanguage(preferred);
    }

    // 2. For signed-in users, the database is the source of truth — fetch it and
    //    apply (and re-sync localStorage) if it differs. Ignored when logged out.
    fetch("/api/profile/language", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data?.ok || !isSupportedLocale(data.language)) return;
        if (data.language !== i18n.language) i18n.changeLanguage(data.language);
        try {
          window.localStorage.setItem(LOCALE_STORAGE_KEY, data.language);
        } catch {
          /* ignore storage errors */
        }
      })
      .catch(() => {
        /* not signed in / offline — keep the local preference */
      });

    return () => {
      active = false;
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
