"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  Palette,
  ShoppingBag,
  DollarSign,
  Recycle,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  UserCheck,
  Package,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Mock dashboard data
const stats = [
  {
    label: "Total Users",
    value: "1,248",
    change: "+12%",
    changeType: "positive",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    href: "/dashboard/admin/users",
  },
  {
    label: "Active Artists",
    value: "156",
    change: "+8%",
    changeType: "positive",
    icon: Palette,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    href: "/dashboard/admin/artists",
  },
  {
    label: "Total Orders",
    value: "324",
    change: "+23%",
    changeType: "positive",
    icon: ShoppingBag,
    color: "text-green-600",
    bgColor: "bg-green-50",
    href: "/dashboard/admin/orders",
  },
  {
    label: "Revenue",
    value: "8.5M",
    unit: "RWF",
    change: "+18%",
    changeType: "positive",
    icon: DollarSign,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    href: "/dashboard/admin/orders",
  },
];

const pendingActions = [
  {
    type: "artwork",
    title: "Artworks Pending Review",
    count: 12,
    icon: Palette,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    href: "/dashboard/admin/artworks?status=pending",
  },
  {
    type: "artist",
    title: "Artists Pending Verification",
    count: 5,
    icon: UserCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    href: "/dashboard/admin/artists?status=pending",
  },
  {
    type: "order",
    title: "Orders Pending Payment",
    count: 8,
    icon: Package,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    href: "/dashboard/admin/orders?status=pending",
  },
];

const recentArtworks = [
  {
    id: "1",
    title: "Sunset Reflections",
    artist: "Marie Uwimana",
    status: "pending",
    submittedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Urban Dreams",
    artist: "Jean Baptiste",
    status: "pending",
    submittedAt: "4 hours ago",
  },
  {
    id: "3",
    title: "Nature's Embrace",
    artist: "Claudine Mukiza",
    status: "approved",
    submittedAt: "6 hours ago",
  },
  {
    id: "4",
    title: "Cultural Heritage",
    artist: "Patrick Habimana",
    status: "rejected",
    submittedAt: "1 day ago",
  },
];

const recentOrders = [
  {
    id: "ORD-456",
    artwork: "Ocean Waves",
    buyer: "John Doe",
    amount: 42000,
    status: "confirmed",
  },
  {
    id: "ORD-455",
    artwork: "Mountain Sunrise",
    buyer: "Sarah M.",
    amount: 35000,
    status: "pending",
  },
  {
    id: "ORD-454",
    artwork: "City Lights",
    buyer: "Michael C.",
    amount: 55000,
    status: "shipped",
  },
];

const impactStats = {
  totalKgDiverted: 1250,
  artworksWithImpact: 342,
  topMaterial: "PET Bottles",
  avgKgPerArtwork: 3.6,
};

const statusConfig = {
  pending: {
    label: "Pending",
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
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: CheckCircle,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: Package,
  },
};

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">
            Overview of RenewCanvas Africa platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all group"
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
            </Link>
          ))}
        </div>

        {/* Pending Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {pendingActions.map((action) => (
            <Link
              key={action.type}
              href={action.href}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 ${action.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <action.icon className={`w-6 h-6 ${action.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-gray-900">{action.count}</p>
                <p className="text-sm text-gray-500">{action.title}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Artwork Submissions */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Recent Artwork Submissions
              </h2>
              <Link
                href="/dashboard/admin/artworks"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentArtworks.map((artwork) => {
                const status =
                  statusConfig[artwork.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={artwork.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center">
                          <Palette className="w-5 h-5 text-teal-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {artwork.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            by {artwork.artist}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {artwork.submittedAt}
                        </p>
                      </div>
                    </div>
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
                href="/dashboard/admin/orders"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const status =
                  statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.artwork}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.id} • {order.buyer}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {order.amount.toLocaleString()} RWF
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
                Platform Environmental Impact
              </h2>
              <p className="text-sm text-gray-600">
                Total waste diverted through all artworks
              </p>
            </div>
            <Link
              href="/dashboard/admin/impact"
              className="ml-auto text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              Manage Impact
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">
                {impactStats.totalKgDiverted.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Total kg Diverted</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-3xl font-bold text-teal-600">
                {impactStats.artworksWithImpact}
              </p>
              <p className="text-sm text-gray-600">Artworks with Impact</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-600">
                {impactStats.avgKgPerArtwork}
              </p>
              <p className="text-sm text-gray-600">Avg kg per Artwork</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <p className="text-xl font-bold text-purple-600">
                {impactStats.topMaterial}
              </p>
              <p className="text-sm text-gray-600">Most Common Material</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/dashboard/admin/artworks?status=pending"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Palette className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Review Artworks</p>
              <p className="text-sm text-gray-500">12 pending</p>
            </div>
          </Link>
          <Link
            href="/dashboard/admin/artists?status=pending"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Verify Artists</p>
              <p className="text-sm text-gray-500">5 pending</p>
            </div>
          </Link>
          <Link
            href="/dashboard/admin/materials"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Recycle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Material Records</p>
              <p className="text-sm text-gray-500">Manage waste data</p>
            </div>
          </Link>
          <Link
            href="/dashboard/admin/users"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-500">1,248 users</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
