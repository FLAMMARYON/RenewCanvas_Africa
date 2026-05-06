"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
  Mail,
  DollarSign,
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  User,
  Palette,
} from "lucide-react";
import { useState } from "react";

// Mock orders data
const orders = [
  {
    id: "ORD-456",
    artwork: {
      id: "a1",
      title: "Ocean Waves",
      price: 42000,
      ownerType: "artist",
    },
    artist: {
      id: "ar1",
      name: "Marie Uwimana",
    },
    buyer: {
      id: "b1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+250 788 123 456",
    },
    status: "confirmed",
    paymentStatus: "paid",
    payoutStatus: "held",
    paymentMethod: "momo",
    createdAt: "2026-04-28T10:30:00",
    payoutEligibleAt: "After delivery + 48 hours",
    platformFee: 8400,
    artistEarnings: 33600,
  },
  {
    id: "ORD-455",
    artwork: {
      id: "a2",
      title: "Mountain Sunrise",
      price: 35000,
      ownerType: "artist",
    },
    artist: {
      id: "ar2",
      name: "Jean Baptiste",
    },
    buyer: {
      id: "b2",
      name: "Sarah Miller",
      email: "sarah@example.com",
      phone: "+250 788 234 567",
    },
    status: "pending",
    paymentStatus: "pending",
    payoutStatus: "not_ready",
    paymentMethod: "bank",
    createdAt: "2026-04-30T08:15:00",
    payoutEligibleAt: "After payment, delivery, and return window",
    platformFee: 7000,
    artistEarnings: 28000,
  },
  {
    id: "ORD-454",
    artwork: {
      id: "a3",
      title: "City Lights",
      price: 55000,
      ownerType: "artist",
    },
    artist: {
      id: "ar1",
      name: "Marie Uwimana",
    },
    buyer: {
      id: "b3",
      name: "Michael Chen",
      email: "michael@example.com",
      phone: "+250 788 345 678",
    },
    status: "shipped",
    paymentStatus: "paid",
    payoutStatus: "held",
    paymentMethod: "card",
    createdAt: "2026-04-25T14:00:00",
    shippedAt: "2026-04-27T09:00:00",
    payoutEligibleAt: "After delivery + 48 hours",
    trackingNumber: "RW123456789",
    platformFee: 11000,
    artistEarnings: 44000,
  },
  {
    id: "ORD-453",
    artwork: {
      id: "a4",
      title: "African Heritage",
      price: 85000,
      ownerType: "artist",
    },
    artist: {
      id: "ar3",
      name: "Patrick Habimana",
    },
    buyer: {
      id: "b4",
      name: "Emma Wilson",
      email: "emma@example.com",
      phone: "+250 788 456 789",
    },
    status: "delivered",
    paymentStatus: "paid",
    payoutStatus: "ready",
    paymentMethod: "momo",
    createdAt: "2026-04-15T11:30:00",
    shippedAt: "2026-04-17T10:00:00",
    deliveredAt: "2026-04-20T14:30:00",
    payoutEligibleAt: "Ready for admin release",
    platformFee: 17000,
    artistEarnings: 68000,
  },
  {
    id: "ORD-452",
    artwork: {
      id: "a5",
      title: "Sunset Reflections",
      price: 38000,
      ownerType: "artist",
    },
    artist: {
      id: "ar4",
      name: "Claudine Mukiza",
    },
    buyer: {
      id: "b5",
      name: "David Brown",
      email: "david@example.com",
      phone: "+250 788 567 890",
    },
    status: "cancelled",
    paymentStatus: "refunded",
    payoutStatus: "cancelled",
    paymentMethod: "momo",
    createdAt: "2026-04-10T16:45:00",
    cancelledAt: "2026-04-12T09:00:00",
    cancelReason: "Buyer requested cancellation",
    payoutEligibleAt: "Not eligible",
    platformFee: 0,
    artistEarnings: 0,
  },
  {
    id: "ORD-451",
    artwork: {
      id: "a6",
      title: "RenewCanvas Studio Panel",
      price: 62000,
      ownerType: "renewcanvas",
    },
    artist: {
      id: "renewcanvas",
      name: "RenewCanvas Africa",
    },
    buyer: {
      id: "b6",
      name: "Aline Uwase",
      email: "aline@example.com",
      phone: "+250 788 678 901",
    },
    status: "delivered",
    paymentStatus: "paid",
    payoutStatus: "not_applicable",
    paymentMethod: "card",
    createdAt: "2026-04-18T13:20:00",
    shippedAt: "2026-04-19T09:00:00",
    deliveredAt: "2026-04-21T11:15:00",
    payoutEligibleAt: "No artist payout: RenewCanvas-owned inventory",
    platformFee: 62000,
    artistEarnings: 0,
  },
];

const statusConfig = {
  pending: {
    label: "Pending",
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

const paymentStatusConfig = {
  pending: { label: "Pending", color: "text-amber-600", bgColor: "bg-amber-50" },
  paid: { label: "Paid", color: "text-green-600", bgColor: "bg-green-50" },
  refunded: { label: "Refunded", color: "text-gray-600", bgColor: "bg-gray-100" },
};

const payoutStatusConfig = {
  not_ready: { label: "Not Ready", color: "text-gray-600", bgColor: "bg-gray-100" },
  held: { label: "Held", color: "text-blue-600", bgColor: "bg-blue-50" },
  ready: { label: "Ready", color: "text-green-600", bgColor: "bg-green-50" },
  released: { label: "Released", color: "text-teal-600", bgColor: "bg-teal-50" },
  cancelled: { label: "Cancelled", color: "text-red-600", bgColor: "bg-red-50" },
  not_applicable: { label: "N/A", color: "text-blue-600", bgColor: "bg-blue-50" },
};

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.artist.name.toLowerCase().includes(searchQuery.toLowerCase());
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
    totalRevenue: orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.artwork.price, 0),
    platformFees: orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.platformFee, 0),
    escrowHeld: orders
      .filter((o) => o.paymentStatus === "paid" && o.payoutStatus === "held")
      .reduce((sum, o) => sum + o.artistEarnings, 0),
    payoutReady: orders.filter((o) => o.payoutStatus === "ready").length,
    renewcanvasOwnedRevenue: orders
      .filter((o) => o.paymentStatus === "paid" && o.artwork.ownerType === "renewcanvas")
      .reduce((sum, o) => sum + o.artwork.price, 0),
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-500">
              Manage buyer payments, delivery mediation, returns, and artist payouts
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Orders
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
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
            <p className="text-sm text-gray-500">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
            <p className="text-sm text-gray-500">Shipped</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            <p className="text-sm text-gray-500">Delivered</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-4 border border-teal-100">
            <p className="text-2xl font-bold text-teal-700">
              {(stats.platformFees / 1000).toFixed(0)}k
            </p>
            <p className="text-sm text-teal-600">Platform Fees (RWF)</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm text-blue-700">Artist Payouts Held</p>
            <p className="text-2xl font-bold text-blue-900">
              {stats.escrowHeld.toLocaleString()} RWF
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Held until 48 hours after delivery with no approved return request.
            </p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-sm text-green-700">Payouts Ready</p>
            <p className="text-2xl font-bold text-green-900">{stats.payoutReady}</p>
            <p className="text-xs text-green-700 mt-1">
              Admin must release payouts. Buyers and artists do not coordinate directly.
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-sm text-purple-700">RenewCanvas-Owned Revenue</p>
            <p className="text-2xl font-bold text-purple-900">
              {stats.renewcanvasOwnedRevenue.toLocaleString()} RWF
            </p>
            <p className="text-xs text-purple-700 mt-1">
              No artist payout is created for platform-owned artwork.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, artworks, buyers, or artists..."
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
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-500">
            <div className="col-span-2">Order ID</div>
            <div className="col-span-3">Artwork / Artist</div>
            <div className="col-span-2">Buyer</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Orders */}
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const status =
                statusConfig[order.status as keyof typeof statusConfig];
              const paymentStatus =
                paymentStatusConfig[
                  order.paymentStatus as keyof typeof paymentStatusConfig
                ];
              const payoutStatus =
                payoutStatusConfig[
                  order.payoutStatus as keyof typeof payoutStatusConfig
                ];
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id}>
                  <div
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
                      {/* Order ID */}
                      <div className="col-span-2 mb-2 lg:mb-0">
                        <p className="font-mono font-semibold text-gray-900">
                          {order.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      {/* Artwork / Artist */}
                      <div className="col-span-3 mb-2 lg:mb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Palette className="w-5 h-5 text-teal-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.artwork.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {order.artwork.ownerType === "renewcanvas"
                                ? "RenewCanvas-owned inventory"
                                : `by ${order.artist.name}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Buyer */}
                      <div className="col-span-2 mb-2 lg:mb-0">
                        <p className="font-medium text-gray-900">
                          {order.buyer.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.buyer.email}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 mb-2 lg:mb-0">
                        <p className="font-semibold text-gray-900">
                          {order.artwork.price.toLocaleString()} RWF
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${paymentStatus.bgColor} ${paymentStatus.color}`}
                        >
                          {paymentStatus.label}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 mb-2 lg:mb-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center gap-1">
                        <button
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(order.id);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Financial Details */}
                        <div className="bg-white p-4 rounded-lg border border-gray-100">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            Financial Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Buyer Payment Destination
                              </span>
                              <span className="font-medium text-gray-900">
                                RenewCanvas Africa
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Order Total</span>
                              <span className="font-medium text-gray-900">
                                {order.artwork.price.toLocaleString()} RWF
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                {order.artwork.ownerType === "renewcanvas"
                                  ? "RenewCanvas Revenue"
                                  : "Platform Fee (20%)"}
                              </span>
                              <span className="font-medium text-teal-600">
                                {order.platformFee.toLocaleString()} RWF
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Artist Payout
                              </span>
                              <span className="font-medium text-gray-900">
                                {order.artwork.ownerType === "renewcanvas"
                                  ? "Not applicable"
                                  : `${order.artistEarnings.toLocaleString()} RWF`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Payout Status</span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${payoutStatus.bgColor} ${payoutStatus.color}`}
                              >
                                {payoutStatus.label}
                              </span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-gray-500">Release Rule</span>
                              <span className="font-medium text-gray-900 text-right">
                                {order.payoutEligibleAt}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Payment Method
                                </span>
                                <span className="font-medium text-gray-900 uppercase">
                                  {order.paymentMethod}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Buyer Details */}
                        <div className="bg-white p-4 rounded-lg border border-gray-100">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            Buyer Details
                          </h4>
                          <div className="space-y-2 text-sm">
                            <p className="font-medium text-gray-900">
                              {order.buyer.name}
                            </p>
                            <p className="text-gray-600">{order.buyer.email}</p>
                            <p className="text-gray-600">{order.buyer.phone}</p>
                          </div>
                          <button className="mt-3 inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700">
                            <Mail className="w-3 h-3" />
                            Message Buyer as Admin
                          </button>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-white p-4 rounded-lg border border-gray-100">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            Order Timeline
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-gray-600">
                                Created: {formatDate(order.createdAt)}
                              </span>
                            </div>
                            {order.shippedAt && (
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-purple-500" />
                                <span className="text-gray-600">
                                  Shipped: {formatDate(order.shippedAt)}
                                </span>
                              </div>
                            )}
                            {order.deliveredAt && (
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-green-500" />
                                <span className="text-gray-600">
                                  Delivered: {formatDate(order.deliveredAt)}
                                </span>
                              </div>
                            )}
                            {order.cancelledAt && (
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-gray-600">
                                  Cancelled: {formatDate(order.cancelledAt)}
                                </span>
                              </div>
                            )}
                            {order.trackingNumber && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                Tracking: {order.trackingNumber}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="md:col-span-3 bg-white p-4 rounded-lg border border-gray-100">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Marketplace Mediation Rule
                        </h4>
                        <p className="text-sm text-gray-600">
                          RenewCanvas Africa is the middleman for this order.
                          Buyer payment is made to RenewCanvas, buyer and artist
                          contact details are not exchanged, and artist payout
                          information is visible only to admins and the artist.
                          If the artwork is RenewCanvas-owned, no artist payout
                          is created and 100% of net sale revenue belongs to
                          RenewCanvas after payment and delivery costs.
                        </p>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-1">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">
                1
              </span>
              <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
