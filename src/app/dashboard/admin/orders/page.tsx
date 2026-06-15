"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { confirmOrderPayment, disburseOrder, listOrders, type FrontendOrder } from "@/lib/frontend/orders-api";
import { orderStatusMeta, isConfirmedRevenueStatus } from "@/lib/frontend/status-labels";
import { Banknote, Calendar, CheckCircle, DollarSign, Mail, Package, Search, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : t("admin.orders.loadError")));
  }, []);

  const runOrderAction = async (orderId: string, action: "confirm" | "disburse") => {
    setBusyOrderId(orderId);
    setStatusMessage("");
    try {
      const newStatus = action === "confirm" ? await confirmOrderPayment(orderId) : await disburseOrder(orderId);
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)));
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t("admin.orders.actionError"));
    } finally {
      setBusyOrderId(null);
    }
  };

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
      // Revenue + platform fees count ONLY confirmed payments (exclude pending/cancelled/refunded/failed).
      revenue: orders.filter((order) => isConfirmedRevenueStatus(order.status)).reduce((sum, order) => sum + order.totalAmount, 0),
      platformFees: orders
        .filter((order) => isConfirmedRevenueStatus(order.status))
        .reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.unitAmount * item.quantity * 0.2, 0), 0),
    }),
    [orders]
  );

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("admin.orders.title")}</h1>
          <p className="text-gray-500">{t("admin.orders.subtitle")}</p>
        </div>

        {statusMessage && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{statusMessage}</div>}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          <Stat label={t("admin.orders.statTotalOrders")} value={stats.total} />
          <Stat label={t("admin.orders.statPendingPayment")} value={stats.pending} tone="amber" />
          <Stat label={t("admin.orders.statInProgress")} value={stats.active} tone="blue" />
          <Stat label={t("admin.orders.statDelivered")} value={stats.delivered} tone="green" />
          <Stat label={t("admin.orders.statGrossRevenue")} value={`${Math.round(stats.revenue).toLocaleString()} RWF`} tone="teal" />
          <Stat label={t("admin.orders.statPlatformFees")} value={`${Math.round(stats.platformFees).toLocaleString()} RWF`} tone="teal" />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t("admin.orders.searchPlaceholder")} className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label={t("admin.orders.columnStatus")} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5">
              <option value="all">{t("admin.orders.filterAllStatus")}</option>
              <option value="pending_payment">{t("statusLabels.pendingPayment")}</option>
              <option value="paid">{t("statusLabels.paid")}</option>
              <option value="processing">{t("statusLabels.processing")}</option>
              <option value="shipped">{t("statusLabels.shipped")}</option>
              <option value="delivered">{t("statusLabels.delivered")}</option>
              <option value="artist_paid">{t("statusLabels.artistPaid")}</option>
              <option value="cancelled">{t("statusLabels.cancelled")}</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <div className="hidden grid-cols-12 gap-4 border-b border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-500 lg:grid">
            <div className="col-span-2">{t("admin.orders.columnOrder")}</div>
            <div className="col-span-3">{t("admin.orders.columnArtworkArtist")}</div>
            <div className="col-span-3">{t("admin.orders.columnBuyer")}</div>
            <div className="col-span-2">{t("admin.orders.columnAmount")}</div>
            <div className="col-span-2">{t("admin.orders.columnStatus")}</div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const item = order.items[0];
              const status = orderStatusMeta(order.status);
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
                        <p className="font-medium text-gray-900">{item?.title ?? t("admin.orders.artworkFallback")}</p>
                        <p className="text-sm text-gray-500">{t("admin.orders.byArtist", { name: item?.artistName ?? "RenewCanvas Africa" })}</p>
                      </div>
                      <div className="lg:col-span-3">
                        <p className="font-medium text-gray-900">{order.buyer?.name ?? String(delivery.fullName ?? t("admin.orders.buyerFallback"))}</p>
                        <p className="text-sm text-gray-500">{order.buyer?.email ?? String(delivery.email ?? "")}</p>
                      </div>
                      <div className="lg:col-span-2">
                        <p className="font-semibold text-gray-900">{order.totalAmount.toLocaleString()} RWF</p>
                        <p className="text-xs uppercase text-gray-500">{order.paymentMethod}</p>
                      </div>
                      <div className="lg:col-span-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${status.bgColor} ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {t(status.labelKey)}
                        </span>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                          <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900"><DollarSign className="h-4 w-4 text-green-600" />{t("admin.orders.financialDetails")}</h4>
                          <div className="space-y-2 text-sm">
                            <Detail label={t("admin.orders.subtotal")} value={`${order.subtotalAmount.toLocaleString()} RWF`} />
                            <Detail label={t("admin.orders.delivery")} value={`${order.deliveryAmount.toLocaleString()} RWF`} />
                            <Detail label={t("admin.orders.total")} value={`${order.totalAmount.toLocaleString()} RWF`} />
                            <Detail label={t("admin.orders.platformFeeEstimate")} value={`${Math.round(order.totalAmount * 0.2).toLocaleString()} RWF`} />
                            <Detail label={t("admin.orders.artistPayoutEstimate")} value={item?.ownerType === "renewcanvas" ? t("admin.orders.notApplicable") : `${Math.round(order.totalAmount * 0.8).toLocaleString()} RWF`} />
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                          <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900"><User className="h-4 w-4 text-blue-600" />{t("admin.orders.buyerAndDelivery")}</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p className="font-medium text-gray-900">{String(delivery.fullName ?? order.buyer?.name ?? t("admin.orders.buyerFallback"))}</p>
                            <p>{String(delivery.email ?? order.buyer?.email ?? "")}</p>
                            <p>{String(delivery.phone ?? "")}</p>
                            <p>{String(delivery.address ?? "")}, {String(delivery.city ?? "")}</p>
                            {order.notes && <p className="rounded bg-gray-50 p-2">{order.notes}</p>}
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-100 bg-white p-4">
                          <h4 className="mb-3 flex items-center gap-2 font-medium text-gray-900"><Calendar className="h-4 w-4 text-purple-600" />{t("admin.orders.adminActions")}</h4>
                          <div className="space-y-3 text-sm text-gray-600">
                            {/* Step 1 — buyer payment received (pending_payment → paid / artwork sold). */}
                            <button
                              type="button"
                              disabled={order.status !== "pending_payment" || busyOrderId === order.id}
                              onClick={() => runOrderAction(order.id, "confirm")}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                              {order.status === "pending_payment" ? t("admin.orders.confirmPaymentReceived") : t("admin.orders.paymentConfirmed")}
                            </button>
                            {/* Step 2 — artist disbursed (paid → artist_paid). Only after payment is confirmed. */}
                            <button
                              type="button"
                              disabled={order.status !== "paid" || busyOrderId === order.id}
                              onClick={() => runOrderAction(order.id, "disburse")}
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Banknote className="h-4 w-4" />
                              {order.status === "artist_paid" ? t("admin.orders.artistDisbursed") : t("admin.orders.confirmArtistDisbursement")}
                            </button>
                            {order.status === "pending_payment" && <p className="text-xs text-gray-500">{t("admin.orders.disbursementHint")}</p>}
                            <a href={`mailto:${order.buyer?.email ?? String(delivery.email ?? "")}`} className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50">
                              <Mail className="h-4 w-4" />{t("admin.orders.emailBuyer")}
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
              <h3 className="mb-1 font-medium text-gray-900">{t("admin.orders.emptyTitle")}</h3>
              <p className="text-gray-500">{t("admin.orders.emptyHint")}</p>
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
