"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { fetchDetailedMetrics, type DetailedMetrics } from "@/lib/frontend/metrics-api";
import {
  Recycle,
  ArrowUp,
  Globe,
  Users,
  Palette,
  Scale,
  Download,
  Calendar,
  Award,
  Leaf,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AdminImpactPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("6m");
  const [metrics, setMetrics] = useState<DetailedMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchDetailedMetrics()
      .then((result) => {
        if (active) setMetrics(result);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : t("adminImpact.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const topArtists = metrics?.topArtists ?? [];
  const avgKgPerArtwork = metrics && metrics.artworkCount > 0 ? metrics.kgDiverted / metrics.artworkCount : 0;

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("adminImpact.title")}</h1>
            <p className="text-gray-500">{t("adminImpact.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} aria-label={t("adminImpact.title")} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
                <option value="30d">{t("adminImpact.range30d")}</option>
                <option value="3m">{t("adminImpact.range3m")}</option>
                <option value="6m">{t("adminImpact.range6m")}</option>
                <option value="1y">{t("adminImpact.range1y")}</option>
              </select>
            </div>
            <button type="button" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              <Download className="w-4 h-4" />
              {t("adminImpact.exportReport")}
            </button>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><Recycle className="w-6 h-6" /></div>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-sm"><ArrowUp className="w-3 h-3" />Live</span>
            </div>
            <p className="text-3xl font-bold">{loading ? "-" : metrics?.kgDiverted.toLocaleString()}</p>
            <p className="text-green-100">{t("adminImpact.totalKgDiverted")}</p>
          </div>
          <MetricCard icon={Leaf} value={metrics?.co2SavedKg.toLocaleString() ?? "-"} label={t("adminImpact.co2Saved")} iconClass="text-blue-600" bgClass="bg-blue-50" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">{t("adminImpact.topArtists")}</h2>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topArtists.map((artist, index) => (
              <div key={artist.id} className={`p-4 rounded-xl border ${index === 0 ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200" : "bg-gray-50 border-gray-100"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-gray-300 text-gray-700">{index + 1}</div>
                  <p className="font-medium text-gray-900 text-sm truncate">{artist.name}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-semibold">{artist.kgDiverted} kg</span>
                  <span className="text-gray-500">{artist.artworks} artworks</span>
                </div>
              </div>
            ))}
            {!loading && topArtists.length === 0 && <p className="text-sm text-gray-500">{t("adminImpact.noArtists")}</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryStat icon={Palette} value={metrics?.artworkCount.toLocaleString() ?? "-"} label={t("adminImpact.artworksWithImpact")} color="teal" />
          <SummaryStat icon={Users} value={metrics?.artistCount.toLocaleString() ?? "-"} label={t("adminImpact.contributingArtists")} color="blue" />
          <SummaryStat icon={Scale} value={avgKgPerArtwork.toFixed(1)} label={t("adminImpact.avgKgPerArtwork")} color="amber" />
          <SummaryStat icon={Globe} value={metrics ? (metrics.kgDiverted / 1000).toFixed(2) : "-"} label={t("adminImpact.tonnesDiverted")} color="green" />
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ icon: Icon, value, label, iconClass, bgClass }: { icon: typeof Leaf; value: string; label: string; iconClass: string; bgClass: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgClass} rounded-lg flex items-center justify-center`}><Icon className={`w-6 h-6 ${iconClass}`} /></div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-gray-500">{label}</p>
    </div>
  );
}

function SummaryStat({ icon: Icon, value, label, color }: { icon: typeof Palette; value: string; label: string; color: "teal" | "blue" | "amber" | "green" }) {
  const colors = {
    teal: "from-teal-50 to-teal-100 border-teal-100 bg-teal-100 text-teal-600 text-teal-700",
    blue: "from-blue-50 to-cyan-50 border-blue-100 bg-blue-100 text-blue-600 text-blue-700",
    amber: "from-amber-50 to-orange-50 border-amber-100 bg-amber-100 text-amber-600 text-amber-700",
    green: "from-green-50 to-emerald-50 border-green-100 bg-green-100 text-green-600 text-green-700",
  };
  const [from, to, border, bg, iconText, valueText] = colors[color].split(" ");
  return (
    <div className={`bg-gradient-to-br ${from} ${to} rounded-xl p-5 border ${border}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}><Icon className={`w-5 h-5 ${iconText}`} /></div>
        <div>
          <p className={`text-2xl font-bold ${valueText}`}>{value}</p>
          <p className={`text-sm ${iconText}`}>{label}</p>
        </div>
      </div>
    </div>
  );
}
