/**
 * Search normalisation that is diacritic- and case-insensitive, so queries in
 * any supported language (English, Kinyarwanda, French, Swahili) match
 * regardless of accents. e.g. "Kigali" matches "Kigáli", "francais" matches
 * "Français".
 *
 * Implemented with a code-point filter (no literal combining-mark characters in
 * source): decompose to NFD, drop the combining diacritical marks block
 * (U+0300–U+036F), then lowercase + trim.
 */
export function normalizeForSearch(value: string): string {
  const decomposed = value.normalize("NFD");
  let out = "";
  for (const ch of decomposed) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x0300 && code <= 0x036f) continue; // skip combining marks
    out += ch;
  }
  return out.toLowerCase().trim();
}

/** True if `haystack` contains `query` after diacritic/case normalisation. */
export function matchesQuery(haystack: string, query: string): boolean {
  const q = normalizeForSearch(query);
  if (!q) return true;
  return normalizeForSearch(haystack).includes(q);
}
