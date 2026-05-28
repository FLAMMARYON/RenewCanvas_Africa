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
  Activity,
  Target,
  Award,
  Leaf,
  TreePine,
  Droplets,
} from "lucide-react";
import { useEffect, useState } from "react";

const materialColors = ["#0EA5E9", "#EC4899", "#8B5CF6", "#6B7280", "#10B981", "#F59E0B", "#EF4444", "#14B8A6", "#6366F1", "#84CC16"];

export default function AdminImpactPage() {
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
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load impact metrics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const monthlyTrend = metrics?.monthlyTrend ?? [];
  const materialBreakdown = metrics?.materialBreakdown ?? [];
  const topArtists = metrics?.topArtists ?? [];
  const maxMonthlyKg = Math.max(1, ...monthlyTrend.map((m) => m.kg));
  const avgKgPerArtwork = metrics && metrics.artworkCount > 0 ? metrics.kgDiverted / metrics.artworkCount : 0;
  const impactGoals = metrics
    ? [
        { title: "Annual Target", current: metrics.kgDiverted, target: 2500, unit: "kg", icon: Target },
        { title: "Monthly Average", current: monthlyTrend.length ? monthlyTrend.reduce((sum, item) => sum + item.kg, 0) / monthlyTrend.length : 0, target: 200, unit: "kg/month", icon: Activity },
        { title: "Active Artists", current: metrics.artistCount, target: 200, unit: "artists", icon: Users },
        { title: "Artworks with Impact", current: metrics.artworkCount, target: 500, unit: "artworks", icon: Palette },
      ]
    : [];

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Impact Dashboard</h1>
            <p className="text-gray-500">Track and manage environmental impact metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
                <option value="30d">Last 30 days</option>
                <option value="3m">Last 3 months</option>
                <option value="6m">Last 6 months</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              <Download className="w-4 h-4" />
              Export Report
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
            <p className="text-green-100">Total kg Diverted</p>
          </div>
          <MetricCard icon={Leaf} value={metrics?.co2SavedKg.toLocaleString() ?? "-"} label="kg CO2 Saved" iconClass="text-blue-600" bgClass="bg-blue-50" />
          <MetricCard icon={TreePine} value={metrics?.treesEquivalent.toLocaleString() ?? "-"} label="Trees Equivalent" iconClass="text-green-600" bgClass="bg-green-50" />
          <MetricCard icon={Droplets} value={metrics ? `${(metrics.waterSavedLitres / 1000).toFixed(1)}k` : "-"} label="Liters Water Saved" iconClass="text-cyan-600" bgClass="bg-cyan-50" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Impact Goals Progress</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactGoals.map((goal) => {
              const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
              return (
                <div key={goal.title}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center"><goal.icon className="w-4 h-4 text-teal-600" /></div>
                      <span className="font-medium text-gray-900 text-sm">{goal.title}</span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-green-500 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{goal.current.toLocaleString(undefined, { maximumFractionDigits: 1 })} / {goal.target.toLocaleString()} {goal.unit}</span>
                    <span className="font-medium text-teal-600">{progress.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
            {!loading && impactGoals.length === 0 && <p className="text-sm text-gray-500">No impact goal data available.</p>}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Monthly Trend</h2>
            <div className="space-y-4">
              {monthlyTrend.map((month) => (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <span className="text-sm text-gray-500">{month.kg.toFixed(1)} kg ({month.artworks} artworks)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-green-400 rounded-full transition-all" style={{ width: `${(month.kg / maxMonthlyKg) * 100}%` }} />
                  </div>
                </div>
              ))}
              {!loading && monthlyTrend.length === 0 && <p className="text-sm text-gray-500">No monthly trend records yet.</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Material Breakdown</h2>
            <div className="space-y-4">
              {materialBreakdown.map((material, index) => (
                <div key={material.material}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: materialColors[index % materialColors.length] }} />
                      <span className="text-sm font-medium text-gray-700">{material.material}</span>
                    </div>
                    <span className="text-sm text-gray-500">{material.kg.toFixed(1)} kg ({material.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${material.percentage}%`, backgroundColor: materialColors[index % materialColors.length] }} />
                  </div>
                </div>
              ))}
              {!loading && materialBreakdown.length === 0 && <p className="text-sm text-gray-500">No material records yet.</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Top Contributing Artists</h2>
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
            {!loading && topArtists.length === 0 && <p className="text-sm text-gray-500">No artist impact records yet.</p>}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryStat icon={Palette} value={metrics?.artworkCount.toLocaleString() ?? "-"} label="Artworks with Impact" color="purple" />
          <SummaryStat icon={Users} value={metrics?.artistCount.toLocaleString() ?? "-"} label="Contributing Artists" color="blue" />
          <SummaryStat icon={Scale} value={avgKgPerArtwork.toFixed(1)} label="Avg kg per Artwork" color="amber" />
          <SummaryStat icon={Globe} value={metrics ? (metrics.kgDiverted / 1000).toFixed(2) : "-"} label="Tonnes Diverted" color="green" />
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

function SummaryStat({ icon: Icon, value, label, color }: { icon: typeof Palette; value: string; label: string; color: "purple" | "blue" | "amber" | "green" }) {
  const colors = {
    purple: "from-purple-50 to-pink-50 border-purple-100 bg-purple-100 text-purple-600 text-purple-700",
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
