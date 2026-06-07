"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_LOCALE, LOCALE_BCP47, type Locale } from "@/lib/i18n/config";

/**
 * Web Speech API narration for the virtual museum.
 *
 * Voice is matched to the active locale (BCP-47). Respects reduced-motion
 * (treated as a hint to keep narration off by default) and degrades silently
 * when speechSynthesis is unavailable.
 */
export function useNarration(locale: Locale = DEFAULT_LOCALE) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!text.trim()) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const bcp47 = LOCALE_BCP47[localeRef.current] ?? "en-US";
    utterance.lang = bcp47;
    const voice = synth.getVoices().find((v) => v.lang === bcp47) ?? synth.getVoices().find((v) => v.lang.startsWith(localeRef.current));
    if (voice) utterance.voice = voice;
    synth.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (!next) {
        window.speechSynthesis?.cancel();
      }
      return next;
    });
  }, []);

  return { supported, enabled, toggle, speak, stop };
}
