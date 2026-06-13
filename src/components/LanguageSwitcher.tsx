"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";
import {
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  applyLocale,
  type AppLocale,
} from "@/i18n/config";

/**
 * Language switcher. Changes the language IN PLACE (no reload, no new tab) and
 * persists the choice (localStorage + cookie) so it applies on every page.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = (SUPPORTED_LOCALES as readonly string[]).includes(i18n.language)
    ? (i18n.language as AppLocale)
    : "en";

  const choose = (locale: AppLocale) => {
    applyLocale(locale);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{current}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {SUPPORTED_LOCALES.map((locale) => (
              <li key={locale}>
                <button
                  type="button"
                  role="option"
                  aria-selected={current === locale}
                  onClick={() => choose(locale)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700 hover:bg-teal-50"
                >
                  {LOCALE_LABELS[locale]}
                  {current === locale && <Check className="h-4 w-4 text-teal-600" />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
