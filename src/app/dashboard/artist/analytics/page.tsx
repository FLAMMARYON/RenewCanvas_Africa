"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { listArtworks, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { listOrders, type FrontendOrder } from "@/lib/frontend/orders-api";
import { readProfile } from "@/lib/frontend/profile-api";
import {
  TrendingUp,
  Eye,
  Heart,
  ShoppingBag,
  DollarSign,
  Recycle,
  Calendar,
  Palette,
  Globe,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type MonthlyData = { month: string; views: number; favourites: number; sales: number; revenue: number };

export default function ArtistAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [userName, setUserName] = useState("Artist");
  const [artworks, setArtworks] = useState<FrontendArtwork[]>([]);
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([readProfile().catch(() => null), listArtworks({ scope: "artist" }), listOrders()])
      .then(([profile, artworkResult, orderResult]) => {
        if (!active) return;
        setUserName(profile?.displayName || "Artist");
        setArtworks(artworkResult.artworks);
        setOrders(orderResult);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load analytics data.");
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
    const conversionRate = views > 0 ? (orders.length / views) * 100 : 0;
    const materialWeights = new Map<string, number>();
    artworks.forEach((artwork) => artwork.materials.forEach((material) => materialWeights.set(material.material, (materialWeights.get(material.material) ?? 0) + material.weightKg)));
    const topMaterial = Array.from(materialWeights.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
    const totalKgDiverted = artworks.reduce((sum, artwork) => sum + artwork.kgDiverted, 0);
    const artworksWithImpact = artworks.filter((artwork) => artwork.kgDiverted > 0).length;
    return { revenue, views, favourites, conversionRate, totalKgDiverted, artworksWithImpact, topMaterial };
  }, [artworks, orders]);

  const overviewStats = [
    { label: "Total Revenue", value: analytics.revenue.toLocaleString(), unit: "RWF", icon: DollarSign, color: "text-green-600", bgColor: "bg-green-50" },
    { label: "Total Views", value: analytics.views.toLocaleString(), icon: Eye, color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Total Favourites", value: analytics.favourites.toLocaleString(), icon: Heart, color: "text-rose-600", bgColor: "bg-rose-50" },
    { label: "Conversion Rate", value: `${analytics.conversionRate.toFixed(1)}%`, icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50" },
  ];

  const monthlyData = useMemo<MonthlyData[]>(() => {
    const months = new Map<string, MonthlyData>();
    const monthKey = (date: string) => new Date(date).toLocaleString("en", { month: "short" });
    artworks.forEach((artwork) => {
      const key = monthKey(artwork.createdAt);
      const current = months.get(key) ?? { month: key, views: 0, favourites: 0, sales: 0, revenue: 0 };
      current.views += artwork.viewCount;
      current.favourites += artwork.favouriteCount;
      months.set(key, current);
    });
    orders.forEach((order) => {
      const key = monthKey(order.createdAt);
      const current = months.get(key) ?? { month: key, views: 0, favourites: 0, sales: 0, revenue: 0 };
      current.sales += order.items.reduce((sum, item) => sum + item.quantity, 0);
      current.revenue += order.items.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);
      months.set(key, current);
    });
    return Array.from(months.values()).slice(-12);
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
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500">Track your performance and growth</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
            </select>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Monthly Trends</h2>
            <div className="space-y-4">
              {monthlyData.map((month) => (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className="text-sm text-gray-500">{month.views} views</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all" style={{ width: `${(month.views / maxMonthlyViews) * 100}%` }} />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{month.favourites}</span>
                    <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{month.sales}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{month.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {!loading && monthlyData.length === 0 && <p className="text-sm text-gray-500">No monthly analytics yet.</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Traffic Sources</h2>
            {/* TODO: Replace this empty state when an existing traffic-source analytics endpoint is added. */}
            <div className="rounded-lg border border-dashed border-gray-200 p-8 text-center">
              <Globe className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">Traffic source data is not available from the existing API routes.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top Performing Artworks</h2>
            <p className="text-sm text-gray-500">Based on views, favourites, and sales</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">Artwork</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">Views</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">Favourites</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">Orders</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topArtworks.map((artwork, index) => (
                  <tr key={artwork.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0"><Palette className="w-5 h-5 text-teal-400" /></div>
                        <div><p className="font-medium text-gray-900">{artwork.title}</p><p className="text-sm text-gray-500">#{index + 1} Top Performer</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right"><span className="inline-flex items-center justify-end gap-1 text-gray-900"><Eye className="w-4 h-4 text-gray-400" />{artwork.views}</span></td>
                    <td className="px-6 py-4 text-right"><span className="inline-flex items-center justify-end gap-1 text-gray-900"><Heart className="w-4 h-4 text-gray-400" />{artwork.favourites}</span></td>
                    <td className="px-6 py-4 text-right"><span className="inline-flex items-center justify-end gap-1 text-gray-900"><ShoppingBag className="w-4 h-4 text-gray-400" />{artwork.orders}</span></td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">{artwork.revenue.toLocaleString()} RWF</td>
                  </tr>
                ))}
                {!loading && topArtworks.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">No artwork performance data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Recycle className="w-6 h-6 text-green-600" /></div>
            <div><h2 className="font-semibold text-gray-900">Your Environmental Impact</h2><p className="text-sm text-gray-600">Waste diverted through your artworks</p></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ImpactStat value={analytics.totalKgDiverted.toFixed(1)} label="Total kg Diverted" tone="green" />
            <ImpactStat value={String(analytics.artworksWithImpact)} label="Artworks with Impact" tone="teal" />
            <ImpactStat value={analytics.artworksWithImpact > 0 ? (analytics.totalKgDiverted / analytics.artworksWithImpact).toFixed(1) : "0.0"} label="Avg kg per Artwork" tone="amber" />
            <ImpactStat value={analytics.topMaterial} label="Most Used Material" tone="purple" small />
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
