import { DEFAULT_LOCALE, type Locale } from "./config";

/**
 * Curated UI strings for the four supported languages. Keep keys flat and
 * stable; add new keys as components are localised. Missing keys fall back to
 * English, then to the key itself.
 */
export const MESSAGES: Record<Locale, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.marketplace": "Marketplace",
    "nav.artists": "Artists",
    "nav.impact": "Impact",
    "nav.contact": "Contact",
    "nav.login": "Sign In",
    "nav.getStarted": "Get Started",
    "common.loading": "Loading…",
    "common.error": "Something went wrong. Please try again.",
    "common.empty": "Nothing to show yet.",
    "gallery.narration.on": "Narration on",
    "gallery.narration.off": "Narration off",
  },
  rw: {
    "nav.home": "Ahabanza",
    "nav.marketplace": "Isoko",
    "nav.artists": "Abahanzi",
    "nav.impact": "Ingaruka",
    "nav.contact": "Twandikire",
    "nav.login": "Injira",
    "nav.getStarted": "Tangira",
    "common.loading": "Biragenda…",
    "common.error": "Hari ikibazo cyabaye. Ongera ugerageze.",
    "common.empty": "Nta kintu kiraboneka.",
    "gallery.narration.on": "Ijwi rifunguye",
    "gallery.narration.off": "Ijwi rifunze",
  },
  fr: {
    "nav.home": "Accueil",
    "nav.marketplace": "Marché",
    "nav.artists": "Artistes",
    "nav.impact": "Impact",
    "nav.contact": "Contact",
    "nav.login": "Se connecter",
    "nav.getStarted": "Commencer",
    "common.loading": "Chargement…",
    "common.error": "Une erreur s'est produite. Veuillez réessayer.",
    "common.empty": "Rien à afficher pour le moment.",
    "gallery.narration.on": "Narration activée",
    "gallery.narration.off": "Narration désactivée",
  },
  sw: {
    "nav.home": "Nyumbani",
    "nav.marketplace": "Soko",
    "nav.artists": "Wasanii",
    "nav.impact": "Athari",
    "nav.contact": "Wasiliana",
    "nav.login": "Ingia",
    "nav.getStarted": "Anza",
    "common.loading": "Inapakia…",
    "common.error": "Hitilafu imetokea. Tafadhali jaribu tena.",
    "common.empty": "Hakuna cha kuonyesha bado.",
    "gallery.narration.on": "Masimulizi yamewashwa",
    "gallery.narration.off": "Masimulizi yamezimwa",
  },
};

export function translate(locale: Locale, key: string): string {
  return MESSAGES[locale]?.[key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
}
