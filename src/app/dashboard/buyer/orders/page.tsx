"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Package,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Star,
  Recycle,
  MapPin,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock orders data
const orders = [
  {
    id: "ORD-456",
    artwork: {
      id: "a1",
      title: "Ocean Waves",
      artist: "Marie Uwimana",
      price: 42000,
      kgDiverted: 2.5,
    },
    status: "delivered",
    paymentStatus: "paid",
    createdAt: "2026-04-15",
    deliveredAt: "2026-04-20",
    shippingAddress: "KG 123 St, Kimironko, Kigali",
    hasReviewed: true,
  },
  {
    id: "ORD-455",
    artwork: {
      id: "a2",
      title: "City Lights",
      artist: "Marie Uwimana",
      price: 55000,
      kgDiverted: 3.2,
    },
    status: "shipped",
    paymentStatus: "paid",
    createdAt: "2026-04-25",
    shippedAt: "2026-04-27",
    trackingNumber: "RW123456789",
    shippingAddress: "KG 123 St, Kimironko, Kigali",
    hasReviewed: false,
  },
  {
    id: "ORD-454",
    artwork: {
      id: "a3",
      title: "Mountain Sunrise",
      artist: "Jean Baptiste",
      price: 35000,
      kgDiverted: 1.8,
    },
    status: "confirmed",
    paymentStatus: "paid",
    createdAt: "2026-04-28",
    shippingAddress: "KG 123 St, Kimironko, Kigali",
    hasReviewed: false,
  },
  {
    id: "ORD-453",
    artwork: {
      id: "a4",
      title: "Garden Dreams",
      artist: "Claudine Mukiza",
      price: 28000,
      kgDiverted: 1.2,
    },
    status: "pending",
    paymentStatus: "pending",
    createdAt: "2026-04-30",
    shippingAddress: "KG 123 St, Kimironko, Kigali",
    hasReviewed: false,
  },
  {
    id: "ORD-452",
    artwork: {
      id: "a5",
      title: "African Heritage",
      artist: "Patrick Habimana",
      price: 85000,
      kgDiverted: 4.5,
    },
    status: "cancelled",
    paymentStatus: "refunded",
    createdAt: "2026-04-10",
    cancelledAt: "2026-04-12",
    cancelReason: "Changed mind",
    shippingAddress: "KG 123 St, Kimironko, Kigali",
    hasReviewed: false,
  },
];

const statusConfig = {
  pending: {
    label: "Pending Payment",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: Clock,
    description: "Complete payment to confirm your order",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: CheckCircle,
    description: "RenewCanvas confirmed payment and is coordinating fulfillment",
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: Truck,
    description: "Your order is on the way",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle,
    description: "Order delivered successfully",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: XCircle,
    description: "Order has been cancelled",
  },
};

export default function BuyerOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.artwork.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    active: orders.filter((o) =>
      ["confirmed", "shipped"].includes(o.status)
    ).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <DashboardLayout role="buyer" userName="John Doe">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500">
            Track orders managed by RenewCanvas from payment to delivery
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">RenewCanvas is your order contact</p>
            <p className="text-sm text-blue-700 mt-1">
              Buyers pay RenewCanvas Africa directly. Admins coordinate all
              order, delivery, and return communication; buyers and artists do
              not contact each other directly.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending Payment</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-sm text-gray-500">Delivered</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders or artworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Payment</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(order.id)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-gray-500">
                            {order.id}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {order.artwork.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          by {order.artwork.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:gap-8">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {order.artwork.price.toLocaleString()} RWF
                        </p>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Recycle className="w-3 h-3" />
                          {order.artwork.kgDiverted} kg diverted
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {order.createdAt}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Order Timeline */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">
                          Order Timeline
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Order Placed
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.createdAt}
                              </p>
                            </div>
                          </div>

                          {order.status !== "pending" &&
                            order.status !== "cancelled" && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                  Payment Confirmed
                                </p>
                                <p className="text-xs text-gray-500">
                                  Paid to RenewCanvas Africa
                                </p>
                              </div>
                            </div>
                            )}

                          {(order.status === "shipped" ||
                            order.status === "delivered") && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Truck className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Shipped
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.shippedAt}
                                  {order.trackingNumber && (
                                    <span className="ml-2">
                                      Tracking: {order.trackingNumber}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}

                          {order.status === "delivered" && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Delivered
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.deliveredAt}
                                </p>
                              </div>
                            </div>
                          )}

                          {order.status === "cancelled" && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Cancelled
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.cancelledAt} - {order.cancelReason}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Shipping & Actions */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">
                          Delivery Address
                        </h4>
                        <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          {order.shippingAddress}
                        </div>

                        <div className="space-y-2">
                          <Link
                            href={`/artwork/${order.artwork.id}`}
                            className="flex items-center gap-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View Artwork
                          </Link>

                          {order.status === "pending" && (
                            <Link
                              href="/order-confirmation"
                              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                            >
                              Complete Payment
                            </Link>
                          )}

                          {order.status === "delivered" && !order.hasReviewed && (
                            <button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium">
                              <Star className="w-4 h-4" />
                              Leave a Review
                            </button>
                          )}

                          <button className="flex items-center gap-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                            <MessageCircle className="w-4 h-4" />
                            Contact RenewCanvas Support
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-1">No orders found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't placed any orders yet"}
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
