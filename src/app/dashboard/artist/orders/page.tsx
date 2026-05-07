"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { listOrders, type FrontendOrder } from "@/lib/frontend/orders-api";
import { Calendar, CheckCircle, Clock, Package, Search, Shield, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const statusConfig = {
  pending_payment: { label: "Pending Payment", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  paid: { label: "Paid", color: "text-blue-600", bgColor: "bg-blue-50", icon: CheckCircle },
  processing: { label: "Processing", color: "text-blue-600", bgColor: "bg-blue-50", icon: CheckCircle },
  shipped: { label: "Shipped", color: "text-purple-600", bgColor: "bg-purple-50", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
  refunded: { label: "Refunded", color: "text-gray-600", bgColor: "bg-gray-100", icon: XCircle },
  failed: { label: "Failed", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
};

export default function ArtistOrdersPage() {
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load orders."));
  }, []);

  const filteredOrders = orders.filter((order) => {
    const item = order.items[0];
    const search = `${order.id} ${item?.title ?? ""} ${item?.ownerType ?? ""}`.toLowerCase();
    return search.includes(searchQuery.toLowerCase()) && (statusFilter === "all" || order.status === statusFilter);
  });

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending_payment").length,
      active: orders.filter((order) => ["paid", "processing", "shipped"].includes(order.status)).length,
      delivered: orders.filter((order) => order.status === "delivered").length,
      earnings: orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.unitAmount * item.quantity * 0.8, 0), 0),
    }),
    [orders]
  );

  return (
    <DashboardLayout role="artist" userName="Artist">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">Fulfill artwork orders coordinated by RenewCanvas admin</p>
        </div>

        {statusMessage && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{statusMessage}</div>}

        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <Shield className="mt-0.5 h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-700">
            Buyer identity, delivery address, and notes are visible only to admins. Artists see the order snapshot needed to prepare the artwork.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Stat label="Total Orders" value={stats.total} />
          <Stat label="Pending Payment" value={stats.pending} tone="amber" />
          <Stat label="In Progress" value={stats.active} tone="blue" />
          <Stat label="Delivered" value={stats.delivered} tone="green" />
          <Stat label="Estimated Earnings" value={`${Math.round(stats.earnings).toLocaleString()} RWF`} tone="teal" />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search orders or artworks..." className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5">
              <option value="all">All Status</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const item = order.items[0];
            const status = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.pending_payment;
            const StatusIcon = status.icon;
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                <button type="button" onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="w-full p-4 text-left hover:bg-gray-50">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex flex-1 items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-teal-50">
                        <Package className="h-8 w-8 text-teal-400" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm text-gray-500">{order.id}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">{item?.title ?? "Artwork"}</p>
                        <p className="text-sm text-gray-500">Buyer details managed by RenewCanvas admin</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.totalAmount.toLocaleString()} RWF</p>
                      <p className="text-sm text-green-600">Est. payout {Math.round(order.totalAmount * 0.8).toLocaleString()} RWF</p>
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 text-sm text-gray-700">
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />Created {new Date(order.createdAt).toLocaleString()}</p>
                        <p>Artwork owner: {item?.ownerType === "renewcanvas" ? "RenewCanvas Africa" : "Artist"}</p>
                        <p>{item?.kgDiverted.toFixed(1) ?? "0.0"} kg diverted snapshot</p>
                      </div>
                      <div className="space-y-2 rounded-lg border border-blue-100 bg-white p-4 text-sm text-blue-700">
                        <p className="font-medium text-blue-900">Admin coordination</p>
                        <p>Prepare the artwork after payment is confirmed. Admin handles buyer communication, delivery instructions, and payout release.</p>
                        {item?.artworkSlug && <Link href={`/artwork/${item.artworkSlug}`} className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-white">View Artwork</Link>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-1 font-medium text-gray-900">No orders found</h3>
              <p className="text-gray-500">Orders assigned to your artworks will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({ label, value, tone = "gray" }: { label: string; value: number | string; tone?: "gray" | "green" | "amber" | "blue" | "teal" }) {
  const colors = { gray: "text-gray-900", green: "text-green-600", amber: "text-amber-600", blue: "text-blue-600", teal: "text-teal-600" };
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <p className={`text-2xl font-bold ${colors[tone]}`}>{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
