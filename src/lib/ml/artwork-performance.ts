/**
 * Artwork performance score — the SINGLE source of truth for "top-performing"
 * ranking.
 *
 * Shared by:
 *   - the artist analytics "Top Performing Artworks" list, and
 *   - the 3D virtual-gallery curation (server-side room filling).
 *
 * Both call this one helper so the two always agree on ordering. Do not invent
 * a different metric in either place.
 *
 * Score = total views + total wishlist/favourites + total units ordered.
 * (This mirrors the original inline analytics sort: `views + favourites + orders`.)
 */
export type ArtworkPerformanceMetrics = {
  /** Lifetime view count. */
  views: number;
  /** Lifetime wishlist / favourite count. */
  favourites: number;
  /** Total units ordered across all orders (sum of order-item quantities). */
  orders: number;
};

export function artworkPerformanceScore(metrics: ArtworkPerformanceMetrics): number {
  return metrics.views + metrics.favourites + metrics.orders;
}

/**
 * Comparator that ranks higher-performing artworks first. Ties break on a stable
 * key (caller-supplied id) so ordering is deterministic across loads.
 */
export function compareArtworkPerformance<T extends ArtworkPerformanceMetrics & { id: string }>(
  a: T,
  b: T
): number {
  const diff = artworkPerformanceScore(b) - artworkPerformanceScore(a);
  if (diff !== 0) return diff;
  return a.id.localeCompare(b.id);
}
