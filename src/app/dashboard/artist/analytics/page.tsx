"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { listArtworks, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { listOrders, PLATFORM_COMMISSION_RATE, type FrontendOrder } from "@/lib/frontend/orders-api";
import { isConfirmedRevenueStatus } from "@/lib/frontend/status-labels";
import { readProfile } from "@/lib/frontend/profile-api";
import {
  Eye,
  Heart,
  ShoppingBag,
  DollarSign,
  Recycle,
  Calendar,
  Palette,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type MonthlyData = { month: string; views: number; favourites: number; sales: number; revenue: number };

export default function ArtistAnalyticsPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("30d");
  const [userName, setUserName] = useState("Artist");
  const [artworks, setArtworks] = useState<FrontendArtwork[]>([]);
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [earnings, setEarnings] = useState<{ earningsRwf: number; kgDiverted: number }>({ earningsRwf: 0, kgDiverted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      readProfile().catch(() => null),
      listArtworks({ scope: "artist" }),
      listOrders(),
      fetch("/api/artist/earnings").then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([profile, artworkResult, orderResult, earningsResult]) => {
        if (!active) return;
        setUserName(profile?.displayName || "Artist");
        setArtworks(artworkResult.artworks);
        setOrders(orderResult);
        if (earningsResult?.ok) {
          setEarnings({ earningsRwf: earningsResult.earningsRwf ?? 0, kgDiverted: earningsResult.kgDiverted ?? 0 });
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : t("artistDashboard.analytics.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const analytics = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.unitAmount * item.quantity, 0), 0);
    const views = artworks.reduce((sum, artwork) => sum + artwork.viewCount, 0);
    const favourites = artworks.reduce((sum, artwork) => sum + artwork.favouriteCount, 0);
    const materialWeights = new Map<string, number>();
    artworks.forEach((artwork) => artwork.materials.forEach((material) => materialWeights.set(material.material, (materialWeights.get(material.material) ?? 0) + material.weightKg)));
    const topMaterial = Array.from(materialWeights.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
    // Waste diverted is a CATALOG metric — the sum of every artwork's kgDiverted
    // (waste is diverted when the piece is created, regardless of sale). Same
    // source the dashboard and the public impact page use.
    const totalKgDiverted = artworks.reduce((sum, artwork) => sum + artwork.kgDiverted, 0);
    const artworksWithImpact = artworks.filter((artwork) => artwork.kgDiverted > 0).length;
    return { revenue, views, favourites, totalKgDiverted, artworksWithImpact, topMaterial };
  }, [artworks, orders]);

  const overviewStats = [
    { label: t("artistDashboard.analytics.confirmedEarnings"), value: earnings.earningsRwf.toLocaleString(), unit: "RWF", icon: DollarSign, color: "text-green-600", bgColor: "bg-green-50" },
    { label: t("artistDashboard.analytics.totalViews"), value: analytics.views.toLocaleString(), icon: Eye, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: t("artistDashboard.analytics.totalFavourites"), value: analytics.favourites.toLocaleString(), icon: Heart, color: "text-rose-600", bgColor: "bg-rose-50" },
  ];

  const monthlyData = useMemo<MonthlyData[]>(() => {
    // Keyed by YYYY-MM so the series is ordered chronologically (not by Map
    // insertion order). All four metrics come from real records — no placeholders.
    const months = new Map<string, MonthlyData & { sortKey: string }>();
    const ensure = (dateString: string) => {
      const date = new Date(dateString);
      const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      let entry = months.get(sortKey);
      if (!entry) {
        entry = {
          sortKey,
          month: date.toLocaleString("en", { month: "short", year: "2-digit" }),
          views: 0,
          favourites: 0,
          sales: 0,
          revenue: 0,
        };
        months.set(sortKey, entry);
      }
      return entry;
    };
    // Views + wishlist (favourites) attributed to each artwork's creation month.
    artworks.forEach((artwork) => {
      const entry = ensure(artwork.createdAt);
      entry.views += artwork.viewCount;
      entry.favourites += artwork.favouriteCount;
    });
    // Orders that month (count) + money actually EARNED that month: the artist's
    // 80% share of CONFIRMED (paid/disbursed) orders only — never pending/cancelled.
    orders.forEach((order) => {
      const entry = ensure(order.createdAt);
      entry.sales += 1;
      if (isConfirmedRevenueStatus(order.status)) {
        entry.revenue += order.items
          .filter((item) => item.ownerType === "artist")
          .reduce((sum, item) => sum + item.unitAmount * item.quantity * (1 - PLATFORM_COMMISSION_RATE), 0);
      }
    });
    return Array.from(months.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-12);
  }, [artworks, orders]);

  const topArtworks = useMemo(
    () =>
      artworks
        .map((artwork) => {
          const artworkOrders = orders.flatMap((order) => order.items.filter((item) => item.artworkId === artwork.id));
          return {
            id: artwork.id,
            title: artwork.title,
            views: artwork.viewCount,
            favourites: artwork.favouriteCount,
            orders: artworkOrders.reduce((sum, item) => sum + item.quantity, 0),
            revenue: artworkOrders.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0),
          };
        })
        .sort((a, b) => b.views + b.favourites + b.orders - (a.views + a.favourites + a.orders))
        .slice(0, 5),
    [artworks, orders]
  );

  const maxMonthlyViews = Math.max(1, ...monthlyData.map((d) => d.views));

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("artistDashboard.analytics.title")}</h1>
            <p className="text-gray-500">{t("artistDashboard.analytics.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
              <option value="7d">{t("artistDashboard.analytics.range7d")}</option>
              <option value="30d">{t("artistDashboard.analytics.range30d")}</option>
              <option value="90d">{t("artistDashboard.analytics.range90d")}</option>
              <option value="12m">{t("artistDashboard.analytics.range12m")}</option>
            </select>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {overviewStats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100">
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "-" : stat.value}
                {stat.unit && <span className="text-sm font-normal text-gray-500 ml-1">{stat.unit}</span>}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">{t("artistDashboard.analytics.monthlyTrends")}</h2>
            <div className="space-y-4">
              {monthlyData.map((month) => (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className="text-sm text-gray-500">{t("artistDashboard.analytics.viewsCount", { count: month.views })}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all" style={{ width: `${(month.views / maxMonthlyViews) * 100}%` }} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1" title={t("artistDashboard.analytics.wishlistMetric", { defaultValue: "Wishlist saves" })}><Heart className="w-3 h-3" />{month.favourites}</span>
                    <span className="flex items-center gap-1" title={t("artistDashboard.analytics.ordersMetric", { defaultValue: "Orders" })}><ShoppingBag className="w-3 h-3" />{month.sales}</span>
                    <span className="font-medium text-teal-700" title={t("artistDashboard.analytics.earnedMetric", { defaultValue: "Earned (RWF)" })}>{Math.round(month.revenue).toLocaleString()} RWF</span>
                  </div>
                </div>
              ))}
              {!loading && monthlyData.length === 0 && <p className="text-sm text-gray-500">{t("artistDashboard.analytics.noMonthlyData")}</p>}
            </div>
          </div>


        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">{t("artistDashboard.analytics.topPerforming")}</h2>
            <p className="text-sm text-gray-500">{t("artistDashboard.analytics.topPerformingSubtitle")}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">{t("artistDashboard.analytics.colArtwork")}</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">{t("artistDashboard.analytics.colViews")}</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">{t("artistDashboard.analytics.colFavourites")}</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">{t("artistDashboard.analytics.colOrders")}</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">{t("artistDashboard.analytics.colRevenue")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topArtworks.map((artwork, index) => (
                  <tr key={artwork.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0"><Palette className="w-5 h-5 text-teal-400" /></div>
                        <div><p className="font-medium text-gray-900">{artwork.title}</p><p className="text-sm text-gray-500">{t("artistDashboard.analytics.rankTopPerformer", { rank: index + 1 })}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right"><span className="inline-flex items-center justify-end gap-1 text-gray-900"><Eye className="w-4 h-4 text-gray-400" />{artwork.views}</span></td>
                    <td className="px-6 py-4 text-right"><span className="inline-flex items-center justify-end gap-1 text-gray-900"><Heart className="w-4 h-4 text-gray-400" />{artwork.favourites}</span></td>
                    <td className="px-6 py-4 text-right"><span className="inline-flex items-center justify-end gap-1 text-gray-900"><ShoppingBag className="w-4 h-4 text-gray-400" />{artwork.orders}</span></td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{artwork.revenue.toLocaleString()} RWF</td>
                  </tr>
                ))}
                {!loading && topArtworks.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">{t("artistDashboard.analytics.noPerformanceData")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Recycle className="w-6 h-6 text-green-600" /></div>
            <div><h2 className="font-semibold text-gray-900">{t("artistDashboard.analytics.environmentalImpact")}</h2><p className="text-sm text-gray-600">{t("artistDashboard.analytics.environmentalImpactSubtitle")}</p></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Waste diverted = catalog sum of every artwork's kgDiverted (the
                same source the dashboard and public impact page use). Earnings,
                separately, stay on confirmed (paid) orders. */}
            <ImpactStat value={analytics.totalKgDiverted.toFixed(1)} label={t("artistDashboard.analytics.totalKgDiverted")} tone="green" />
            <ImpactStat value={String(analytics.artworksWithImpact)} label={t("artistDashboard.analytics.artworksWithImpact")} tone="teal" />
            <ImpactStat value={analytics.artworksWithImpact > 0 ? (analytics.totalKgDiverted / analytics.artworksWithImpact).toFixed(1) : "0.0"} label={t("artistDashboard.analytics.avgKgPerArtwork")} tone="amber" />
            <ImpactStat value={analytics.topMaterial} label={t("artistDashboard.analytics.mostUsedMaterial")} tone="purple" small />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ImpactStat({ value, label, tone, small = false }: { value: string; label: string; tone: "green" | "teal" | "amber" | "purple"; small?: boolean }) {
  const colors = { green: "text-green-600", teal: "text-teal-600", amber: "text-amber-600", purple: "text-purple-600" };
  return (
    <div className="bg-white/70 rounded-lg p-4">
      <p className={`${small ? "text-xl" : "text-3xl"} font-bold ${colors[tone]}`}>{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}
