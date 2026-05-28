"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { listArtworks, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { listOrders, type FrontendOrder } from "@/lib/frontend/orders-api";
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
import { useEffect, useMemo, useState } from "react";

const statusConfig = {
  submitted: { label: "Pending Review", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  under_review: { label: "Under Review", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  approved: { label: "Approved", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  listed: { label: "Listed", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
  sold: { label: "Sold", color: "text-purple-600", bgColor: "bg-purple-50", icon: ShoppingBag },
};

export default function ArtistDashboard() {
  const [userName, setUserName] = useState("Artist");
  const [artworks, setArtworks] = useState<FrontendArtwork[]>([]);
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      setLoading(true);
      setError("");
      try {
        const [profile, artworkResult, orderResult] = await Promise.all([
          readProfile().catch(() => null),
          listArtworks({ scope: "artist" }),
          listOrders(),
        ]);
        if (!active) return;
        setUserName(profile?.displayName || "Artist");
        setArtworks(artworkResult.artworks);
        setOrders(orderResult);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: "Total Artworks", value: artworks.length.toLocaleString(), icon: Palette, color: "text-teal-600", bgColor: "bg-teal-50" },
      { label: "Total Views", value: artworks.reduce((sum, artwork) => sum + artwork.viewCount, 0).toLocaleString(), icon: Eye, color: "text-blue-600", bgColor: "bg-blue-50" },
      { label: "Total Favourites", value: artworks.reduce((sum, artwork) => sum + artwork.favouriteCount, 0).toLocaleString(), icon: Heart, color: "text-rose-600", bgColor: "bg-rose-50" },
      { label: "Total Orders", value: orders.length.toLocaleString(), icon: ShoppingBag, color: "text-green-600", bgColor: "bg-green-50" },
    ],
    [artworks, orders]
  );

  const totalEarnings = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce((itemSum, item) => {
            if (item.ownerType === "renewcanvas") return itemSum;
            return itemSum + item.unitAmount * item.quantity * 0.8;
          }, 0),
        0
      ),
    [orders]
  );
  const totalImpact = artworks.reduce((sum, artwork) => sum + artwork.kgDiverted, 0);
  const recentArtworks = [...artworks].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 4);
  const recentOrders = [...orders].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 3);
  const firstName = userName.split(" ")[0];

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, {firstName}!</h1>
              <p className="text-teal-100">Manage your artworks, track orders, and grow your creative business.</p>
            </div>
            <Link href="/dashboard/artist/artworks/create" className="inline-flex items-center gap-2 px-5 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors">
              <Plus className="w-5 h-5" />
              Create New Artwork
            </Link>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all">
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{loading ? "-" : stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? "-" : Math.round(totalEarnings).toLocaleString()} RWF</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Estimated artist payout from live order records.</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-amber-50 rounded-xl p-6 border border-teal-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <Recycle className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Environmental Impact</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? "-" : totalImpact.toFixed(1)} kg</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Total waste diverted through your artworks.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Your Artworks</h2>
              <Link href="/dashboard/artist/artworks" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentArtworks.map((artwork) => {
                const status = statusConfig[artwork.status as keyof typeof statusConfig] ?? statusConfig.submitted;
                return (
                  <div key={artwork.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {artwork.images[0] ? <img src={artwork.images[0].url} alt={artwork.images[0].altText} className="h-full w-full object-cover" /> : <Palette className="w-6 h-6 text-teal-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{artwork.title}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{artwork.viewCount}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{artwork.favouriteCount}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{artwork.priceAmount.toLocaleString()} RWF</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          <status.icon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                    {artwork.status === "rejected" && artwork.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600 flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        {artwork.rejectionReason}
                      </div>
                    )}
                  </div>
                );
              })}
              {!loading && recentArtworks.length === 0 && <p className="p-6 text-sm text-gray-500">No artworks yet.</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/dashboard/artist/orders" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const item = order.items[0];
                  return (
                    <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{item?.title ?? "Artwork order"}</p>
                          <p className="text-sm text-gray-500">Status: {order.status.replaceAll("_", " ")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{order.totalAmount.toLocaleString()} RWF</p>
                          <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{loading ? "Loading orders..." : "No orders yet"}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/dashboard/artist/artworks/create" className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors"><Plus className="w-6 h-6 text-teal-600" /></div>
            <div><p className="font-medium text-gray-900">New Artwork</p><p className="text-sm text-gray-500">Create a listing</p></div>
          </Link>
          <Link href="/dashboard/artist/artworks/create?ai=true" className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors"><Sparkles className="w-6 h-6 text-purple-600" /></div>
            <div><p className="font-medium text-gray-900">AI Pricing</p><p className="text-sm text-gray-500">Get price suggestions</p></div>
          </Link>
          <Link href="/dashboard/artist/analytics" className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors"><BarChart3 className="w-6 h-6 text-blue-600" /></div>
            <div><p className="font-medium text-gray-900">Analytics</p><p className="text-sm text-gray-500">View performance</p></div>
          </Link>
          <Link href="/dashboard/artist/profile" className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors"><TrendingUp className="w-6 h-6 text-amber-600" /></div>
            <div><p className="font-medium text-gray-900">Profile</p><p className="text-sm text-gray-500">Complete your profile</p></div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
