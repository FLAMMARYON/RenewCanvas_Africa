"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { listOrders, type FrontendOrder } from "@/lib/frontend/orders-api";
import { Calendar, CheckCircle, Clock, DollarSign, Mail, Package, Search, Truck, User, XCircle } from "lucide-react";
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

export default function AdminOrdersPage() {
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
    const delivery = order.deliveryAddress ?? {};
    const search = `${order.id} ${item?.title ?? ""} ${item?.artistName ?? ""} ${order.buyer?.name ?? ""} ${order.buyer?.email ?? ""} ${String(delivery.fullName ?? "")}`.toLowerCase();
    return search.includes(searchQuery.toLowerCase()) && (statusFilter === "all" || order.status === statusFilter);
  });

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending_payment").length,
      active: orders.filter((order) => ["paid", "processing", "shipped"].includes(order.status)).length,
      delivered: orders.filter((order) => order.status === "delivered").length,
      revenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      platformFees: orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.unitAmount * item.quantity * 0.2, 0), 0),
    }),
    [orders]
  );

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500">Review buyer orders, payment instructions, delivery snapshots, and artist payouts</p>
        </div>

        {statusMessage && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{statusMessage}</div>}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <Stat label="Total Orders" value={stats.total} />
          <Stat label="Pending Payment" value={stats.pending} tone="amber" />
          <Stat label="In Progress" value={stats.active} tone="blue" />
          <Stat label="Delivered" value={stats.delivered} tone="green" />
          <Stat label="Gross Revenue" value={`${Math.round(stats.revenue).toLocaleString()} RWF`} tone="teal" />
          <Stat label="Platform Fees" value={`${Math.round(stats.platformFees).toLocaleString()} RWF`} tone="teal" />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search orders, artworks, buyers, or artists..." className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500" />
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

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="hidden grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-500 lg:grid">
            <div className="col-span-2">Order</div>
            <div className="col-span-3">Artwork / Artist</div>
            <div className="col-span-3">Buyer</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Status</div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const item = order.items[0];
              const status = statusConfig[order.status as keyof typeof statusConfig] ?? statusConfig.pending_payment;
              const StatusIcon = status.icon;
              const isExpanded = expandedOrder === order.id;
              const delivery = order.deliveryAddress ?? {};
              return (
                <div key={order.id}>
                  <button type="button" onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="w-full p-4 text-left hover:bg-gray-50">
                    <div className="grid gap-3 lg:grid-cols-12 lg:items-center">
                      <div className="lg:col-span-2">
                        <p className="font-mono font-semibold text-gray-900">{order.id}</p>
                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="lg:col-span-3">
                        <p className="font-medium text-gray-900">{item?.title ?? "Artwork"}</p>
                        <p className="text-sm text-gray-500">by {item?.artistName ?? "RenewCanvas Africa"}</p>
                      </div>
                      <div className="lg:col-span-3">
                        <p className="font-medium text-gray-900">{order.buyer?.name ?? String(delivery.fullName ?? "Buyer")}</p>
                        <p className="text-sm text-gray-500">{order.buyer?.email ?? String(delivery.email ?? "")}</p>
                      </div>
                      <div className="lg:col-span-2">
                        <p className="font-semibold text-gray-900">{order.totalAmount.toLocaleString()} RWF</p>
                        <p className="text-xs uppercase text-gray-500">{order.paymentMethod}</p>
                      </div>
                      <div className="lg:col-span-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                          <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900"><DollarSign className="h-4 w-4 text-green-600" />Financial Details</h4>
                          <div className="space-y-2 text-sm">
                            <Detail label="Subtotal" value={`${order.subtotalAmount.toLocaleString()} RWF`} />
                            <Detail label="Delivery" value={`${order.deliveryAmount.toLocaleString()} RWF`} />
                            <Detail label="Total" value={`${order.totalAmount.toLocaleString()} RWF`} />
                            <Detail label="Platform Fee Estimate" value={`${Math.round(order.totalAmount * 0.2).toLocaleString()} RWF`} />
                            <Detail label="Artist Payout Estimate" value={item?.ownerType === "renewcanvas" ? "Not applicable" : `${Math.round(order.totalAmount * 0.8).toLocaleString()} RWF`} />
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                          <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900"><User className="h-4 w-4 text-blue-600" />Buyer And Delivery</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p className="font-medium text-gray-900">{String(delivery.fullName ?? order.buyer?.name ?? "Buyer")}</p>
                            <p>{String(delivery.email ?? order.buyer?.email ?? "")}</p>
                            <p>{String(delivery.phone ?? "")}</p>
                            <p>{String(delivery.address ?? "")}, {String(delivery.city ?? "")}</p>
                            {order.notes && <p className="rounded bg-gray-50 p-2">{order.notes}</p>}
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                          <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900"><Calendar className="h-4 w-4 text-purple-600" />Admin Actions</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>Confirm payment to RenewCanvas before asking the artist to ship.</p>
                            <p>Keep buyer and artist communication mediated through admin.</p>
                            <Link href={`/order-confirmation?order=${encodeURIComponent(order.id)}`} className="inline-flex rounded-lg bg-teal-600 px-4 py-2 text-white">Payment Instructions</Link>
                            <a href={`mailto:${order.buyer?.email ?? String(delivery.email ?? "")}`} className="ml-2 inline-flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-gray-700">
                              <Mail className="h-4 w-4" />Email Buyer
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-1 font-medium text-gray-900">No orders found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
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
