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
  Shield,
} from "lucide-react";
import { useState } from "react";

// Mock orders data
const orders = [
  {
    id: "ORD-001",
    artwork: {
      title: "Ocean Waves",
      price: 42000,
      image: "/placeholder.jpg",
    },
    status: "confirmed",
    paymentStatus: "paid",
    payoutStatus: "held",
    payoutEligibleAt: "48 hours after delivery",
    createdAt: "2026-04-28",
    earnings: 33600, // 80% of price
  },
  {
    id: "ORD-002",
    artwork: {
      title: "City Lights",
      price: 55000,
      image: "/placeholder.jpg",
    },
    status: "pending",
    paymentStatus: "pending",
    payoutStatus: "not_ready",
    payoutEligibleAt: "After payment, delivery, and return window",
    createdAt: "2026-04-30",
    earnings: 44000,
  },
  {
    id: "ORD-003",
    artwork: {
      title: "African Heritage",
      price: 85000,
      image: "/placeholder.jpg",
    },
    status: "shipped",
    paymentStatus: "paid",
    payoutStatus: "held",
    payoutEligibleAt: "48 hours after delivery",
    createdAt: "2026-04-15",
    shippedAt: "2026-04-18",
    trackingNumber: "RW123456789",
    earnings: 68000,
  },
  {
    id: "ORD-004",
    artwork: {
      title: "Mountain Sunrise",
      price: 35000,
      image: "/placeholder.jpg",
    },
    status: "delivered",
    paymentStatus: "paid",
    payoutStatus: "ready",
    payoutEligibleAt: "Eligible for admin release",
    createdAt: "2026-03-20",
    shippedAt: "2026-03-23",
    deliveredAt: "2026-03-25",
    earnings: 28000,
  },
  {
    id: "ORD-005",
    artwork: {
      title: "Sunset Reflections",
      price: 38000,
      image: "/placeholder.jpg",
    },
    status: "cancelled",
    paymentStatus: "refunded",
    payoutStatus: "cancelled",
    payoutEligibleAt: "Not eligible",
    createdAt: "2026-04-10",
    cancelledAt: "2026-04-12",
    cancelReason: "Buyer changed mind",
    earnings: 0,
  },
];

const statusConfig = {
  pending: {
    label: "Pending Payment",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: Clock,
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
    icon: XCircle,
  },
};

export default function ArtistOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.payoutStatus.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    totalEarnings: orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.earnings, 0),
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <DashboardLayout role="artist" userName="Marie Uwimana">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">
            Manage fulfillment through RenewCanvas admin mediation
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Orders</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            <p className="text-sm text-gray-500">To Ship</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-sm text-gray-500">Delivered</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 col-span-2 lg:col-span-1">
            <p className="text-2xl font-bold text-teal-600">
              {stats.totalEarnings.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Earnings (RWF)</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Admin-mediated orders</p>
            <p className="text-sm text-blue-700 mt-1">
              Buyers pay RenewCanvas Africa directly. Buyer contact details are
              hidden from artists; admins coordinate delivery and release artist
              payouts after the 48-hour return request window closes.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, artworks, or payout status..."
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
                    {/* Order Info */}
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
                          Buyer details managed by RenewCanvas admin
                        </p>
                      </div>
                    </div>

                    {/* Price & Date */}
                    <div className="flex items-center justify-between lg:gap-8">
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {order.artwork.price.toLocaleString()} RWF
                        </p>
                        <p className="text-sm text-green-600">
                          Payout: {order.earnings.toLocaleString()} RWF
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{order.createdAt}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Admin-Mediated Order Details */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Buyer Privacy & Admin Coordination
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>
                            Buyer identity and contact details are visible only
                            to RenewCanvas admins.
                          </p>
                          <p>
                            Use the admin order thread for delivery questions,
                            packaging issues, or shipment updates.
                          </p>
                          <p className="font-medium text-gray-900">
                            Payout status: {order.payoutStatus.replace("_", " ")}
                          </p>
                          <p>Release timing: {order.payoutEligibleAt}</p>
                        </div>

                        {/* Contact Buttons */}
                        <div className="flex gap-2 mt-4">
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Shield className="w-4 h-4" />
                            Message Admin
                          </button>
                        </div>
                      </div>

                      {/* Order Timeline */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
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

                          {order.status === "confirmed" && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Payment Confirmed
                                </p>
                                <p className="text-xs text-gray-500">
                                  Paid to RenewCanvas, awaiting fulfillment
                                </p>
                              </div>
                            </div>
                          )}

                          {order.shippedAt && (
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

                          {order.deliveredAt && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Delivered
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.deliveredAt}. Payout releases after
                                  the 48-hour return window if no return request
                                  is approved.
                                </p>
                              </div>
                            </div>
                          )}

                          {order.cancelledAt && (
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
                    </div>

                    {/* Actions */}
                    {order.status === "confirmed" && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                          <Truck className="w-4 h-4" />
                          Mark as Shipped
                        </button>
                      </div>
                    )}
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
              <p className="text-gray-500">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't received any orders yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
