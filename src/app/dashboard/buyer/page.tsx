"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { type FrontendOrder, listOrders } from "@/lib/frontend/orders-api";
import { readWishlist, type WishlistItem } from "@/lib/frontend/wishlist-api";
import {
  Heart,
  ShoppingBag,
  Package,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  Eye,
  Recycle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: Clock,
  },
  pending_payment: {
    label: "Pending Payment",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: Clock,
  },
  paid: {
    label: "Paid",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: CheckCircle,
  },
  processing: {
    label: "Processing",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: CheckCircle,
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: Truck,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: CheckCircle,
  },
  in_transit: {
    label: "In Transit",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: Clock,
  },
  refunded: {
    label: "Refunded",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: Clock,
  },
  failed: {
    label: "Failed",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: Clock,
  },
};

export default function BuyerDashboard() {
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    const profileRequest = fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile?.firstName) {
          setUserName(data.profile.firstName);
        } else if (data?.user?.name) {
          // Use first name from full name
          const firstName = data.user.name.split(" ")[0];
          setUserName(firstName);
        }
      })
      .catch(() => {});

    const wishlistRequest = readWishlist().then(setWishlistItems);
    const ordersRequest = listOrders().then(setOrders);

    Promise.allSettled([profileRequest, wishlistRequest, ordersRequest])
      .then((results) => {
        const failedDataRequest = results.slice(1).find((result) => result.status === "rejected");
        if (failedDataRequest?.status === "rejected") {
          setStatusMessage(
            failedDataRequest.reason instanceof Error
              ? failedDataRequest.reason.message
              : "Could not load account activity."
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const accountMetrics = useMemo(() => {
    const purchasedItems = orders.flatMap((order) => order.items);
    const artistIds = new Set(purchasedItems.map((item) => item.artistId).filter(Boolean));
    const pendingOrders = orders.filter((order) => ["pending_payment", "paid", "processing", "shipped"].includes(order.status));
    const wasteDiverted = purchasedItems.reduce((sum, item) => sum + item.kgDiverted * item.quantity, 0);
    const artistIncome = purchasedItems.reduce((sum, item) => sum + item.unitAmount * item.quantity, 0);

    return {
      savedArtworks: wishlistItems.length,
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      wasteDiverted,
      artistsSupported: artistIds.size,
      artworksPurchased: purchasedItems.reduce((sum, item) => sum + item.quantity, 0),
      artistIncome,
    };
  }, [orders, wishlistItems.length]);

  const stats = [
    {
      label: "Saved Artworks",
      value: accountMetrics.savedArtworks.toString(),
      icon: Heart,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      href: "/dashboard/buyer/wishlist",
    },
    {
      label: "Total Orders",
      value: accountMetrics.totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      href: "/dashboard/buyer/orders",
    },
    {
      label: "Active Orders",
      value: accountMetrics.pendingOrders.toString(),
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/dashboard/buyer/orders",
    },
    {
      label: "Impact (kg diverted)",
      value: accountMetrics.wasteDiverted.toFixed(1),
      icon: Recycle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/dashboard/buyer/orders",
    },
  ];

  const recentOrders = orders.slice(0, 3);
  const savedArtworks = wishlistItems.slice(0, 3);

  return (
    <DashboardLayout role="buyer" userName={loading ? "..." : userName}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back{loading ? "" : `, ${userName}`}!
          </h1>
          <p className="text-teal-100">
            Track your orders, manage your wishlist, and discover your
            environmental impact.
          </p>
        </div>

        {statusMessage && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {statusMessage}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all"
            >
              <div
                className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              <Link
                href="/dashboard/buyer/orders"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const item = order.items[0];
                const status = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.pending_payment;
                return (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {item?.title ?? "Artwork"}
                        </p>
                        <p className="text-sm text-gray-500">
                          by {item?.artistName ?? "RenewCanvas Africa"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                          >
                            <status.icon className="w-3 h-3" />
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {order.totalAmount.toLocaleString()} RWF
                        </p>
                        <Link
                          href="/dashboard/buyer/orders"
                          className="text-xs text-teal-600 hover:text-teal-700"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
              {recentOrders.length === 0 && (
                <div className="p-8 text-center">
                  <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <p className="font-medium text-gray-900">No orders yet</p>
                  <p className="mt-1 text-sm text-gray-500">Orders you place will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Saved Artworks */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Saved Artworks</h2>
              <Link
                href="/dashboard/buyer/wishlist"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {savedArtworks.map((item) => {
                const artwork = item.artwork;
                return (
                <div
                  key={artwork.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {artwork.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        by {artwork.artist?.name ?? "RenewCanvas Africa"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {artwork.materials.slice(0, 2).map((material) => (
                          <span
                            key={material.id}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {material.material}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {artwork.priceAmount.toLocaleString()} RWF
                      </p>
                      <Link
                        href={`/artwork/${artwork.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
                );
              })}
              {savedArtworks.length === 0 && (
                <div className="p-8 text-center">
                  <Heart className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <p className="font-medium text-gray-900">No saved artworks yet</p>
                  <p className="mt-1 text-sm text-gray-500">Saved artworks from the marketplace will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Your Impact Section */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Your Environmental Impact
              </h2>
              <p className="text-sm text-gray-600">
                Through your purchases on RenewCanvas Africa
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/70 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{accountMetrics.wasteDiverted.toFixed(1)} kg</p>
              <p className="text-xs text-gray-600">Waste Diverted</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-teal-600">{accountMetrics.artistsSupported}</p>
              <p className="text-xs text-gray-600">Artists Supported</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{accountMetrics.artworksPurchased}</p>
              <p className="text-xs text-gray-600">Artworks Purchased</p>
            </div>
            <div className="bg-white/70 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{accountMetrics.artistIncome.toLocaleString()}</p>
              <p className="text-xs text-gray-600">RWF to Artists</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/marketplace"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
              <ShoppingBag className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Browse Marketplace</p>
              <p className="text-sm text-gray-500">Discover new artworks</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teal-600 ml-auto transition-colors" />
          </Link>
          <Link
            href="/artists"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Heart className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Meet Artists</p>
              <p className="text-sm text-gray-500">Explore artist profiles</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teal-600 ml-auto transition-colors" />
          </Link>
          <Link
            href="/impact"
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Recycle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Platform Impact</p>
              <p className="text-sm text-gray-500">See collective impact</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-teal-600 ml-auto transition-colors" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
