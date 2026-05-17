"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { readProfile } from "@/lib/frontend/profile-api";
import {
  Palette,
  Eye,
  Heart,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Recycle,
  DollarSign,
  BarChart3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Mock data - will be replaced with API calls
const stats = [
  {
    label: "Total Artworks",
    value: "12",
    icon: Palette,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    change: "+2 this month",
    changeType: "positive",
  },
  {
    label: "Total Views",
    value: "1,248",
    icon: Eye,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    change: "+156 this week",
    changeType: "positive",
  },
  {
    label: "Total Favourites",
    value: "86",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    change: "+12 this week",
    changeType: "positive",
  },
  {
    label: "Total Orders",
    value: "8",
    icon: ShoppingBag,
    color: "text-green-600",
    bgColor: "bg-green-50",
    change: "+3 this month",
    changeType: "positive",
  },
];

const artworks = [
  {
    id: "1",
    title: "Ocean Waves",
    price: 42000,
    status: "approved",
    views: 245,
    favourites: 18,
    createdAt: "2026-04-10",
    materials: ["PET bottles", "fabric scraps"],
    kgDiverted: 2.5,
  },
  {
    id: "2",
    title: "Mountain Sunrise",
    price: 35000,
    status: "pending",
    views: 89,
    favourites: 5,
    createdAt: "2026-04-25",
    materials: ["bottle caps", "cardboard"],
    kgDiverted: 1.8,
  },
  {
    id: "3",
    title: "City Lights",
    price: 55000,
    status: "approved",
    views: 312,
    favourites: 24,
    createdAt: "2026-04-05",
    materials: ["aluminium cans", "glass"],
    kgDiverted: 3.2,
  },
  {
    id: "4",
    title: "Garden Dreams",
    price: 28000,
    status: "rejected",
    views: 0,
    favourites: 0,
    createdAt: "2026-04-28",
    materials: ["plastic bags"],
    kgDiverted: 1.2,
    rejectionReason: "Image quality needs improvement",
  },
];

const recentOrders = [
  {
    id: "ORD-001",
    artwork: "Ocean Waves",
    price: 42000,
    status: "confirmed",
    payoutStatus: "Held until 48h after delivery",
    date: "2026-04-28",
  },
  {
    id: "ORD-002",
    artwork: "City Lights",
    price: 55000,
    status: "pending",
    payoutStatus: "Awaiting buyer payment to RenewCanvas",
    date: "2026-04-30",
  },
];

const statusConfig = {
  pending: {
    label: "Pending Review",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: XCircle,
  },
  sold: {
    label: "Sold",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: ShoppingBag,
  },
};

export default function ArtistDashboard() {
  const [userName, setUserName] = useState("Artist");
  const totalEarnings = 225000;
  const totalImpact = artworks.reduce((sum, a) => sum + a.kgDiverted, 0);

  useEffect(() => {
    readProfile()
      .then((profile) => setUserName(profile.displayName || "Artist"))
      .catch(() => {});
  }, []);

  const firstName = userName.split(" ")[0];

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {firstName}!
              </h1>
              <p className="text-teal-100">
                Manage your artworks, track orders, and grow your creative
                business.
              </p>
            </div>
            <Link
              href="/dashboard/artist/artworks/create"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create New Artwork
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all"
            >
              <div
                className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xs text-green-600 mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Earnings & Impact Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalEarnings.toLocaleString()} RWF
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Payouts are released by admins after the 48-hour return window
            </p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-amber-50 rounded-xl p-6 border border-teal-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Recycle className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Environmental Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalImpact.toFixed(1)} kg
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Total waste diverted through your artworks
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Artworks */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Your Artworks</h2>
              <Link
                href="/dashboard/artist/artworks"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {artworks.slice(0, 4).map((artwork) => {
                const status =
                  statusConfig[artwork.status as keyof typeof statusConfig];
                return (
                  <div
                    key={artwork.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Palette className="w-6 h-6 text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {artwork.title}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {artwork.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {artwork.favourites}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {artwork.price.toLocaleString()} RWF
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                    {artwork.status === "rejected" &&
                      artwork.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600 flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {artwork.rejectionReason}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              <Link
                href="/dashboard/artist/orders"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {order.artwork}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.payoutStatus}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {order.price.toLocaleString()} RWF
                        </p>
                        <p className="text-xs text-gray-400">{order.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create more artworks to attract buyers
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/artist/artworks/create"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <Plus className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">New Artwork</p>
              <p className="text-sm text-gray-500">Create a listing</p>
            </div>
          </Link>
          <Link
            href="/dashboard/artist/artworks/create?ai=true"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Pricing</p>
              <p className="text-sm text-gray-500">Get price suggestions</p>
            </div>
          </Link>
          <Link
            href="/dashboard/artist/analytics"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-500">View performance</p>
            </div>
          </Link>
          <Link
            href="/dashboard/artist/profile"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Profile</p>
              <p className="text-sm text-gray-500">Complete your profile</p>
            </div>
          </Link>
        </div>

        {/* Tips for Artists */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Tips to Boost Your Sales
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1">
                High-Quality Photos
              </h3>
              <p className="text-sm text-gray-600">
                Use natural lighting and multiple angles for your artwork photos
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1">
                Complete Profile
              </h3>
              <p className="text-sm text-gray-600">
                Buyers trust artists with detailed profiles and portfolios
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-1">
                Material Details
              </h3>
              <p className="text-sm text-gray-600">
                Document the recycled materials to highlight environmental
                impact
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
