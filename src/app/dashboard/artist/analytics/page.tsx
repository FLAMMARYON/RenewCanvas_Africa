"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { readProfile } from "@/lib/frontend/profile-api";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  ShoppingBag,
  DollarSign,
  Recycle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Palette,
  Users,
  Globe,
} from "lucide-react";
import { useEffect, useState } from "react";

// Mock analytics data
const overviewStats = [
  {
    label: "Total Revenue",
    value: "225,000",
    unit: "RWF",
    change: "+23%",
    changeType: "positive",
    icon: DollarSign,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    label: "Total Views",
    value: "4,892",
    change: "+18%",
    changeType: "positive",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    label: "Total Favourites",
    value: "342",
    change: "+12%",
    changeType: "positive",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    label: "Conversion Rate",
    value: "4.2%",
    change: "-0.3%",
    changeType: "negative",
    icon: TrendingUp,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

const monthlyData = [
  { month: "Jan", views: 320, favourites: 28, sales: 2, revenue: 45000 },
  { month: "Feb", views: 450, favourites: 35, sales: 1, revenue: 35000 },
  { month: "Mar", views: 680, favourites: 52, sales: 3, revenue: 75000 },
  { month: "Apr", views: 890, favourites: 67, sales: 2, revenue: 70000 },
];

const topArtworks = [
  {
    id: "1",
    title: "Ocean Waves",
    views: 523,
    favourites: 67,
    orders: 2,
    revenue: 84000,
  },
  {
    id: "2",
    title: "City Lights",
    views: 312,
    favourites: 24,
    orders: 1,
    revenue: 55000,
  },
  {
    id: "3",
    title: "Mountain Sunrise",
    views: 245,
    favourites: 18,
    orders: 1,
    revenue: 42000,
  },
  {
    id: "4",
    title: "Sunset Reflections",
    views: 156,
    favourites: 12,
    orders: 1,
    revenue: 38000,
  },
];

const trafficSources = [
  { source: "Direct", percentage: 42, visits: 2054 },
  { source: "Marketplace Search", percentage: 28, visits: 1370 },
  { source: "Social Media", percentage: 18, visits: 881 },
  { source: "External Links", percentage: 12, visits: 587 },
];

const impactMetrics = {
  totalKgDiverted: 28.5,
  artworksWithImpact: 12,
  topMaterial: "PET Bottles",
  avgKgPerArtwork: 2.4,
};

export default function ArtistAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [userName, setUserName] = useState("Artist");

  useEffect(() => {
    readProfile()
      .then((profile) => setUserName(profile.displayName || "Artist"))
      .catch(() => {});
  }, []);

  const maxMonthlyViews = Math.max(...monthlyData.map((d) => d.views));

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500">Track your performance and growth</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="12m">Last 12 months</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-sm font-medium ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.changeType === "positive" ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
                {stat.unit && (
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    {stat.unit}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Monthly Trends</h2>
            <div className="space-y-4">
              {monthlyData.map((month) => (
                <div key={month.month}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {month.month}
                    </span>
                    <span className="text-sm text-gray-500">
                      {month.views} views
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all"
                      style={{
                        width: `${(month.views / maxMonthlyViews) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {month.favourites}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      {month.sales}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {month.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Traffic Sources</h2>
            <div className="space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {source.source}
                    </span>
                    <span className="text-sm text-gray-500">
                      {source.percentage}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {source.visits.toLocaleString()} visits
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Artworks */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Top Performing Artworks
            </h2>
            <p className="text-sm text-gray-500">
              Based on views, favourites, and sales
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-sm font-medium text-gray-500 px-6 py-3">
                    Artwork
                  </th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">
                    Views
                  </th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">
                    Favourites
                  </th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">
                    Orders
                  </th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topArtworks.map((artwork, index) => (
                  <tr key={artwork.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Palette className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {artwork.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            #{index + 1} Top Performer
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-gray-900">
                        <Eye className="w-4 h-4 text-gray-400" />
                        {artwork.views}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-gray-900">
                        <Heart className="w-4 h-4 text-gray-400" />
                        {artwork.favourites}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-gray-900">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        {artwork.orders}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      {artwork.revenue.toLocaleString()} RWF
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Recycle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Your Environmental Impact
              </h2>
              <p className="text-sm text-gray-600">
                Waste diverted through your artworks
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">
                {impactMetrics.totalKgDiverted}
              </p>
              <p className="text-sm text-gray-600">Total kg Diverted</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-3xl font-bold text-teal-600">
                {impactMetrics.artworksWithImpact}
              </p>
              <p className="text-sm text-gray-600">Artworks with Impact</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-600">
                {impactMetrics.avgKgPerArtwork}
              </p>
              <p className="text-sm text-gray-600">Avg kg per Artwork</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-xl font-bold text-purple-600">
                {impactMetrics.topMaterial}
              </p>
              <p className="text-sm text-gray-600">Most Used Material</p>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            Tips to Improve Performance
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Increase Views</h3>
              </div>
              <p className="text-sm text-gray-600">
                Share your profile on social media and use relevant tags in your
                artwork descriptions.
              </p>
            </div>
            <div className="p-4 bg-rose-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <h3 className="font-medium text-gray-900">Get More Favourites</h3>
              </div>
              <p className="text-sm text-gray-600">
                High-quality photos and detailed descriptions help buyers connect
                with your art.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Boost Conversions</h3>
              </div>
              <p className="text-sm text-gray-600">
                Competitive pricing and quick response to inquiries can increase
                your sales rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
