"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { listArtworks, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { fetchDetailedMetrics, formatMetric, type DetailedMetrics } from "@/lib/frontend/metrics-api";
import { listOrders, type FrontendOrder } from "@/lib/frontend/orders-api";
import { artworkStatusMeta, orderStatusMeta, isConfirmedRevenueStatus } from "@/lib/frontend/status-labels";
import {
  Users,
  Palette,
  ShoppingBag,
  Recycle,
  UserCheck,
  Package,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [artworks, setArtworks] = useState<FrontendArtwork[]>([]);
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [metrics, setMetrics] = useState<DetailedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const [artworkResult, orderResult, metricResult] = await Promise.all([
          listArtworks({ scope: "admin" }),
          listOrders(),
          fetchDetailedMetrics(),
        ]);
        if (!active) return;
        setArtworks(artworkResult.artworks);
        setOrders(orderResult);
        setMetrics(metricResult);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : t("admin.overview.loadError"));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const pendingArtworkCount = artworks.filter((artwork) => ["submitted", "under_review"].includes(artwork.status)).length;
  // Artist verification is a SEPARATE concern from artwork moderation. A pending
  // artwork submission must never inflate this count (it feeds the Artwork
  // Review card above). The dedicated artist-verification queue is not built yet,
  // so there are no pending artist verifications to surface — wire this to that
  // queue when the feature lands. Decoupled from the artwork verification queue.
  const pendingArtistCount = 0;
  const pendingOrderCount = orders.filter((order) => order.status === "pending_payment").length;
  // Revenue counts ONLY confirmed payments (buyer → RenewCanvas). Pending /
  // cancelled / refunded / failed orders are excluded.
  const revenue = orders
    .filter((order) => isConfirmedRevenueStatus(order.status))
    .reduce((sum, order) => sum + order.totalAmount, 0);

  const stats = useMemo(
    () => [
      { label: t("admin.overview.statActiveArtists"), value: metrics ? formatMetric(metrics.artistCount) : "-", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50", href: "/dashboard/admin/artists" },
      { label: t("admin.overview.statArtworks"), value: metrics ? formatMetric(metrics.artworkCount) : "-", icon: Palette, color: "text-purple-600", bgColor: "bg-purple-50", href: "/dashboard/admin/artworks" },
      { label: t("admin.overview.statTotalOrders"), value: orders.length.toLocaleString(), icon: ShoppingBag, color: "text-green-600", bgColor: "bg-green-50", href: "/dashboard/admin/orders" },
      // Revenue card intentionally renders NO icon (no $ / DollarSign) — RWF text only.
      { label: t("admin.overview.statRevenue"), value: revenue.toLocaleString(), unit: "RWF", icon: null, color: "text-teal-600", bgColor: "bg-teal-50", href: "/dashboard/admin/orders" },
    ],
    [metrics, orders.length, revenue, t]
  );

  const pendingActions = [
    { type: "artwork", title: t("admin.overview.pendingArtworksReview"), count: pendingArtworkCount, icon: Palette, color: "text-amber-600", bgColor: "bg-amber-50", href: "/dashboard/admin/artworks?status=submitted" },
    { type: "artist", title: t("admin.overview.pendingArtistsVerification"), count: pendingArtistCount, icon: UserCheck, color: "text-blue-600", bgColor: "bg-blue-50", href: "/dashboard/admin/artists?status=pending" },
    { type: "order", title: t("admin.overview.pendingOrdersPayment"), count: pendingOrderCount, icon: Package, color: "text-purple-600", bgColor: "bg-purple-50", href: "/dashboard/admin/orders?status=pending_payment" },
  ];

  const recentArtworks = [...artworks].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4);
  const recentOrders = [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 3);
  const topMaterial = metrics?.materialBreakdown[0]?.material ?? "-";
  const avgKgPerArtwork = metrics && metrics.artworkCount > 0 ? metrics.kgDiverted / metrics.artworkCount : 0;

  return (
    <DashboardLayout role="admin" userName={t("admin.overview.adminUser")}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("admin.overview.title")}</h1>
          <p className="text-gray-500">{t("admin.overview.subtitle")}</p>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                {stat.icon && (
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "-" : stat.value}
                {stat.unit && <span className="text-sm font-normal text-gray-500 ml-1">{stat.unit}</span>}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {pendingActions.map((action) => (
            <Link key={action.type} href={action.href} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all flex items-center gap-4">
              <div className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">{loading ? "-" : action.count}</p>
                <p className="text-sm text-gray-500">{action.title}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{t("admin.overview.recentArtworkSubmissions")}</h2>
              <Link href="/dashboard/admin/artworks" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                {t("admin.overview.viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentArtworks.map((artwork) => {
                const status = artworkStatusMeta(artwork.status);
                const StatusIcon = status.icon;
                return (
                  <div key={artwork.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {artwork.images[0] ? <img src={artwork.images[0].url} alt={artwork.images[0].altText} className="h-full w-full object-cover" /> : <Palette className="w-5 h-5 text-teal-500" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{artwork.title}</p>
                          <p className="text-sm text-gray-500">{t("admin.overview.byArtist", { name: artwork.artist?.name ?? "RenewCanvas Africa" })}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {t(status.labelKey)}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{new Date(artwork.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!loading && recentArtworks.length === 0 && <p className="p-6 text-sm text-gray-500">{t("admin.overview.noArtworkRecords")}</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{t("admin.overview.recentOrders")}</h2>
              <Link href="/dashboard/admin/orders" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                {t("admin.overview.viewAll")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const status = orderStatusMeta(order.status);
                const StatusIcon = status.icon;
                const item = order.items[0];
                return (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item?.title ?? t("admin.overview.artworkOrder")}</p>
                          <p className="text-sm text-gray-500">{order.id} - {order.buyer?.name ?? t("admin.overview.buyer")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{order.totalAmount.toLocaleString()} RWF</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {t(status.labelKey)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!loading && recentOrders.length === 0 && <p className="p-6 text-sm text-gray-500">{t("admin.overview.noOrderRecords")}</p>}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><Recycle className="w-6 h-6 text-green-600" /></div>
            <div>
              <h2 className="font-semibold text-gray-900">{t("admin.overview.environmentalImpactTitle")}</h2>
              <p className="text-sm text-gray-600">{t("admin.overview.environmentalImpactSubtitle")}</p>
            </div>
            <Link href="/dashboard/admin/impact" className="ml-auto text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              {t("admin.overview.manageImpact")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ImpactStat value={metrics ? metrics.kgDiverted.toLocaleString() : "-"} label={t("admin.overview.impactTotalKgDiverted")} color="text-green-600" />
            <ImpactStat value={metrics ? metrics.artworkCount.toLocaleString() : "-"} label={t("admin.overview.impactArtworksWithImpact")} color="text-teal-600" />
            <ImpactStat value={metrics ? avgKgPerArtwork.toFixed(1) : "-"} label={t("admin.overview.impactAvgKgPerArtwork")} color="text-amber-600" />
            <ImpactStat value={topMaterial} label={t("admin.overview.impactMostCommonMaterial")} color="text-purple-600" small />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction href="/dashboard/admin/artworks?status=submitted" icon={Palette} title={t("admin.overview.quickReviewArtworks")} detail={t("admin.overview.quickPendingCount", { count: pendingArtworkCount })} tone="amber" />
          <QuickAction href="/dashboard/admin/artists?status=pending" icon={UserCheck} title={t("admin.overview.quickVerifyArtists")} detail={t("admin.overview.quickPendingCount", { count: pendingArtistCount })} tone="blue" />
          <QuickAction href="/dashboard/admin/materials" icon={Recycle} title={t("admin.overview.quickMaterialRecords")} detail={t("admin.overview.quickManageWasteData")} tone="green" />
          <QuickAction href="/dashboard/admin/users" icon={Users} title={t("admin.overview.quickManageUsers")} detail={t("admin.overview.quickUserEndpointPending")} tone="purple" />
        </div>
      </div>
    </DashboardLayout>
  );
}

function ImpactStat({ value, label, color, small = false }: { value: string; label: string; color: string; small?: boolean }) {
  return (
    <div className="bg-white/70 rounded-lg p-4">
      <p className={`${small ? "text-xl" : "text-3xl"} font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
}

function QuickAction({ href, icon: Icon, title, detail, tone }: { href: string; icon: typeof Palette; title: string; detail: string; tone: "amber" | "blue" | "green" | "purple" }) {
  const colors = {
    amber: "bg-amber-50 text-amber-600 hover:border-amber-200 group-hover:bg-amber-100",
    blue: "bg-blue-50 text-blue-600 hover:border-blue-200 group-hover:bg-blue-100",
    green: "bg-green-50 text-green-600 hover:border-green-200 group-hover:bg-green-100",
    purple: "bg-purple-50 text-purple-600 hover:border-purple-200 group-hover:bg-purple-100",
  };
  const [boxColor, iconColor, hoverColor, groupColor] = colors[tone].split(" ");
  return (
    <Link href={href} className={`group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 ${hoverColor} hover:shadow-md transition-all`}>
      <div className={`w-12 h-12 ${boxColor} rounded-lg flex items-center justify-center ${groupColor} transition-colors`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{detail}</p>
      </div>
    </Link>
  );
}
