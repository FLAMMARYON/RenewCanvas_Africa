"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Recycle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Globe,
  Users,
  Palette,
  Scale,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Leaf,
  TreePine,
  Droplets,
} from "lucide-react";
import { useState } from "react";

// Mock impact data
const impactOverview = {
  totalKgDiverted: 1745.8,
  totalArtworks: 342,
  totalArtists: 156,
  avgKgPerArtwork: 5.1,
  changeFromLastMonth: "+12.5%",
  co2Saved: 2618.7,
  treesEquivalent: 43,
  waterSaved: 87250,
};

const monthlyTrend = [
  { month: "Jan", kg: 98.5, artworks: 24 },
  { month: "Feb", kg: 125.3, artworks: 31 },
  { month: "Mar", kg: 156.8, artworks: 42 },
  { month: "Apr", kg: 198.2, artworks: 52 },
  { month: "May", kg: 234.5, artworks: 58 },
  { month: "Jun", kg: 289.1, artworks: 67 },
];

const topArtists = [
  { name: "Marie Uwimana", kgDiverted: 85.5, artworks: 12 },
  { name: "Patrick Habimana", kgDiverted: 72.3, artworks: 15 },
  { name: "Claudine Mukiza", kgDiverted: 68.9, artworks: 8 },
  { name: "Jean Baptiste", kgDiverted: 54.2, artworks: 6 },
  { name: "Grace Ingabire", kgDiverted: 48.7, artworks: 9 },
];

const materialBreakdown = [
  { name: "PET Bottles", kg: 485.5, percentage: 27.8, color: "#0EA5E9" },
  { name: "Fabric Scraps", kg: 312.8, percentage: 17.9, color: "#EC4899" },
  { name: "Cardboard", kg: 234.1, percentage: 13.4, color: "#8B5CF6" },
  { name: "Metal Cans", kg: 198.2, percentage: 11.4, color: "#6B7280" },
  { name: "Glass", kg: 167.9, percentage: 9.6, color: "#10B981" },
  { name: "Others", kg: 347.3, percentage: 19.9, color: "#F59E0B" },
];

const impactGoals = [
  {
    title: "Annual Target",
    current: 1745.8,
    target: 2500,
    unit: "kg",
    icon: Target,
  },
  {
    title: "Monthly Average",
    current: 145.5,
    target: 200,
    unit: "kg/month",
    icon: Activity,
  },
  {
    title: "Active Artists",
    current: 156,
    target: 200,
    unit: "artists",
    icon: Users,
  },
  {
    title: "Artworks with Impact",
    current: 342,
    target: 500,
    unit: "artworks",
    icon: Palette,
  },
];

export default function AdminImpactPage() {
  const [timeRange, setTimeRange] = useState("6m");

  const maxMonthlyKg = Math.max(...monthlyTrend.map((m) => m.kg));

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Impact Dashboard
            </h1>
            <p className="text-gray-500">
              Track and manage environmental impact metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
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

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Recycle className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-sm">
                <ArrowUp className="w-3 h-3" />
                {impactOverview.changeFromLastMonth}
              </span>
            </div>
            <p className="text-3xl font-bold">
              {impactOverview.totalKgDiverted.toLocaleString()}
            </p>
            <p className="text-green-100">Total kg Diverted</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {impactOverview.co2Saved.toLocaleString()}
            </p>
            <p className="text-gray-500">kg CO₂ Saved</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {impactOverview.treesEquivalent}
            </p>
            <p className="text-gray-500">Trees Equivalent</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-50 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {(impactOverview.waterSaved / 1000).toFixed(1)}k
            </p>
            <p className="text-gray-500">Liters Water Saved</p>
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">
            Impact Goals Progress
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactGoals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <div key={goal.title}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                        <goal.icon className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {goal.title}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-green-500 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                    </span>
                    <span className="font-medium text-teal-600">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Monthly Trend</h2>
            <div className="space-y-4">
              {monthlyTrend.map((month) => (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {month.month}
                    </span>
                    <span className="text-sm text-gray-500">
                      {month.kg.toFixed(1)} kg ({month.artworks} artworks)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-green-400 rounded-full transition-all"
                      style={{
                        width: `${(month.kg / maxMonthlyKg) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Material Breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">
              Material Breakdown
            </h2>
            <div className="space-y-4">
              {materialBreakdown.map((material) => (
                <div key={material.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: material.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {material.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {material.kg.toFixed(1)} kg ({material.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${material.percentage}%`,
                        backgroundColor: material.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Top Contributing Artists</h2>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topArtists.map((artist, index) => (
              <div
                key={artist.name}
                className={`p-4 rounded-xl border ${
                  index === 0
                    ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
                    : index === 1
                    ? "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200"
                    : index === 2
                    ? "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-amber-500 text-white"
                        : index === 1
                        ? "bg-gray-400 text-white"
                        : index === 2
                        ? "bg-orange-400 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {artist.name}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-semibold">
                    {artist.kgDiverted} kg
                  </span>
                  <span className="text-gray-500">{artist.artworks} artworks</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">
                  {impactOverview.totalArtworks}
                </p>
                <p className="text-sm text-purple-600">Artworks with Impact</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {impactOverview.totalArtists}
                </p>
                <p className="text-sm text-blue-600">Contributing Artists</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">
                  {impactOverview.avgKgPerArtwork}
                </p>
                <p className="text-sm text-amber-600">Avg kg per Artwork</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">
                  {(impactOverview.totalKgDiverted / 1000).toFixed(2)}
                </p>
                <p className="text-sm text-green-600">Tonnes Diverted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
