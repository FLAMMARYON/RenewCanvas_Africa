/**
 * Frontend API client for platform metrics
 */

export interface PlatformMetrics {
  kgDiverted: number;
  co2SavedKg: number;
  treesEquivalent: number;
  waterSavedLitres: number;
  artistCount: number;
  artworkCount: number;
  artistIncomeRwf: number;
  lastUpdated: string;
}

export interface MaterialBreakdown {
  material: string;
  kg: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  kg: number;
  artworks: number;
}

export interface TopArtist {
  id: string;
  name: string;
  kgDiverted: number;
  artworks: number;
}

export interface DetailedMetrics extends PlatformMetrics {
  materialBreakdown: MaterialBreakdown[];
  monthlyTrend: MonthlyTrend[];
  topArtists: TopArtist[];
}

/**
 * Fetch public platform metrics
 */
export async function fetchMetrics(): Promise<PlatformMetrics> {
  const res = await fetch("/api/metrics");
  if (!res.ok) {
    throw new Error("Failed to fetch metrics");
  }
  return res.json();
}

/**
 * Fetch detailed metrics (admin only)
 */
export async function fetchDetailedMetrics(): Promise<DetailedMetrics> {
  const res = await fetch("/api/metrics?detailed=true");
  if (!res.ok) {
    throw new Error("Failed to fetch detailed metrics");
  }
  return res.json();
}

/**
 * Format metric value for display
 * Returns "-" for zero/null values
 */
export function formatMetric(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return "-";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

/**
 * Format currency in RWF
 */
export function formatRwf(amountRwf: number): string {
  if (amountRwf === 0) return "-";
  return `${amountRwf.toLocaleString()} RWF`;
}
