/**
 * Metrics calculation service
 * Calculates real platform metrics from database records
 */

import { PrismaClient, Prisma } from "@prisma/client";

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
 * Environmental impact calculation factors
 * Based on industry research and RenewCanvas impact methodology
 */
const IMPACT_FACTORS = {
  // Trees equivalent: 1 tree ≈ 59kg paper, so kgDiverted * (1/59) ≈ 0.017
  treesPerKg: 0.017,
  // Water saved: approximately 50 litres per kg of recycled material
  waterLitresPerKg: 50,
  // Default CO2 factor if not calculated: 1.5 kg CO2e per kg diverted
  defaultCo2PerKg: 1.5,
};

/**
 * Get aggregate platform metrics
 */
export async function getPlatformMetrics(
  db: PrismaClient
): Promise<PlatformMetrics> {
  // Get total kg diverted from artworks that are listed or sold
  const kgResult = await db.artwork.aggregate({
    _sum: {
      kgDiverted: true,
    },
    where: {
      status: {
        in: ["listed", "sold"],
      },
    },
  });

  const kgDiverted = Number(kgResult._sum.kgDiverted || 0);

  // Get CO2 saved from impact estimates
  const co2Result = await db.impactEstimate.aggregate({
    _sum: {
      co2eAvoidedKg: true,
    },
  });

  // Use calculated CO2 if available, otherwise estimate from kg diverted
  const co2SavedKg =
    Number(co2Result._sum.co2eAvoidedKg || 0) ||
    kgDiverted * IMPACT_FACTORS.defaultCo2PerKg;

  // Calculate environmental equivalents
  const treesEquivalent = Math.round(kgDiverted * IMPACT_FACTORS.treesPerKg);
  const waterSavedLitres = Math.round(
    kgDiverted * IMPACT_FACTORS.waterLitresPerKg
  );

  // Count artists
  const artistCount = await db.user.count({
    where: {
      role: "artist",
      status: "active",
    },
  });

  // Count artworks (listed or sold)
  const artworkCount = await db.artwork.count({
    where: {
      status: {
        in: ["listed", "sold"],
      },
    },
  });

  // Calculate total artist income from paid payouts
  const payoutResult = await db.payoutLedger.aggregate({
    _sum: {
      payoutCents: true,
    },
    where: {
      status: "paid",
    },
  });

  const artistIncomeRwf = Math.round(
    (Number(payoutResult._sum.payoutCents || 0)) / 100
  );

  return {
    kgDiverted: Math.round(kgDiverted * 10) / 10, // Round to 1 decimal
    co2SavedKg: Math.round(co2SavedKg * 10) / 10,
    treesEquivalent,
    waterSavedLitres,
    artistCount,
    artworkCount,
    artistIncomeRwf,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get detailed metrics for admin dashboard
 */
export async function getDetailedMetrics(
  db: PrismaClient
): Promise<DetailedMetrics> {
  const baseMetrics = await getPlatformMetrics(db);

  // Get material breakdown
  const materialData = await db.artworkMaterial.groupBy({
    by: ["material"],
    _sum: {
      weightKg: true,
    },
    orderBy: {
      _sum: {
        weightKg: "desc",
      },
    },
    take: 10,
  });

  const totalMaterialKg = materialData.reduce(
    (sum, m) => sum + Number(m._sum.weightKg || 0),
    0
  );

  const materialBreakdown: MaterialBreakdown[] = materialData.map((m) => {
    const kg = Number(m._sum.weightKg || 0);
    return {
      material: m.material,
      kg: Math.round(kg * 10) / 10,
      percentage:
        totalMaterialKg > 0
          ? Math.round((kg / totalMaterialKg) * 1000) / 10
          : 0,
    };
  });

  // Get monthly trend (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyData = await db.$queryRaw<
    Array<{ month: string; kg: Prisma.Decimal; count: bigint }>
  >`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
      COALESCE(SUM("kgDiverted"), 0) as kg,
      COUNT(*) as count
    FROM "Artwork"
    WHERE "status" IN ('listed', 'sold')
      AND "createdAt" >= ${twelveMonthsAgo}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY DATE_TRUNC('month', "createdAt") ASC
  `;

  const monthlyTrend: MonthlyTrend[] = monthlyData.map((m) => ({
    month: m.month,
    kg: Math.round(Number(m.kg) * 10) / 10,
    artworks: Number(m.count),
  }));

  // Get top artists by kg diverted
  const topArtistsData = await db.artwork.groupBy({
    by: ["artistId"],
    _sum: {
      kgDiverted: true,
    },
    _count: {
      id: true,
    },
    where: {
      status: {
        in: ["listed", "sold"],
      },
    },
    orderBy: {
      _sum: {
        kgDiverted: "desc",
      },
    },
    take: 10,
  });

  // Get artist names
  const artistIds = topArtistsData.map((a) => a.artistId);
  const artists = await db.user.findMany({
    where: { id: { in: artistIds } },
    select: { id: true, name: true },
  });

  const artistNameMap = new Map(artists.map((a) => [a.id, a.name]));

  const topArtists: TopArtist[] = topArtistsData.map((a) => ({
    id: a.artistId,
    name: artistNameMap.get(a.artistId) || "Unknown Artist",
    kgDiverted: Math.round(Number(a._sum.kgDiverted || 0) * 10) / 10,
    artworks: a._count.id,
  }));

  return {
    ...baseMetrics,
    materialBreakdown,
    monthlyTrend,
    topArtists,
  };
}

/**
 * Format metrics for public display
 * Returns "-" for zero values to indicate data not yet available
 */
export function formatMetricForDisplay(value: number): string {
  if (value === 0) return "-";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}
