import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_LOCALE, isLocale, resolveLocale, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { translate } from "@/lib/i18n/messages";
import { matchesQuery, normalizeForSearch } from "@/lib/i18n/search";

test("locale config supports en/rw/fr/sw", () => {
  assert.deepEqual([...SUPPORTED_LOCALES], ["en", "rw", "fr", "sw"]);
  assert.equal(isLocale("rw"), true);
  assert.equal(isLocale("de"), false);
  assert.equal(resolveLocale("sw"), "sw");
  assert.equal(resolveLocale("xx"), DEFAULT_LOCALE);
});

test("translate returns localized strings and falls back to English then key", () => {
  assert.equal(translate("fr", "nav.home"), "Accueil");
  assert.equal(translate("sw", "nav.marketplace"), "Soko");
  // missing key → returns the key itself
  assert.equal(translate("rw", "nav.nonexistent"), "nav.nonexistent");
});

test("normalizeForSearch strips diacritics and lowercases", () => {
  assert.equal(normalizeForSearch("Kigáli"), "kigali");
  assert.equal(normalizeForSearch("Français"), "francais");
  assert.equal(normalizeForSearch("  RÉCYCLÉ  "), "recycle");
});

test("matchesQuery is diacritic- and case-insensitive", () => {
  assert.equal(matchesQuery("Recycled art from Kigáli", "kigali"), true);
  assert.equal(matchesQuery("Œuvre française", "francaise"), true);
  assert.equal(matchesQuery("Plastic bottle sculpture", "metal"), false);
  assert.equal(matchesQuery("anything", ""), true);
});
