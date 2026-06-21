"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { ADMIN_CONTACT_PHONE, isOrderVisible, listOrders, type FrontendOrder } from "@/lib/frontend/orders-api";
import { customerFacingOrderStatus, orderStatusMeta } from "@/lib/frontend/status-labels";
import { Calendar, Package, Phone, Search, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function ArtistOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    listOrders()
      .then(setOrders)
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : t("artistDashboard.orders.loadError")));
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (!isOrderVisible(order)) return false; // hide cancelled orders older than 10 days
    const item = order.items[0];
    const search = `${order.id} ${item?.title ?? ""} ${item?.ownerType ?? ""}`.toLowerCase();
    // Match on the customer-facing status so the "Delivered" filter also covers
    // disbursed (artist_paid) orders, which display as Delivered.
    return search.includes(searchQuery.toLowerCase()) && (statusFilter === "all" || customerFacingOrderStatus(order.status) === statusFilter);
  });

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === "pending_payment").length,
      active: orders.filter((order) => order.status === "paid").length,
      // Disbursed (artist_paid) shows as Delivered for the artist, so count it here too.
      delivered: orders.filter((order) => customerFacingOrderStatus(order.status) === "delivered").length,
      earnings: orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.unitAmount * item.quantity * 0.8, 0), 0),
    }),
    [orders]
  );

  return (
    <DashboardLayout role="artist" userName="Artist">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("artistDashboard.orders.title")}</h1>
          <p className="text-gray-500">{t("artistDashboard.orders.subtitle")}</p>
        </div>

        {statusMessage && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{statusMessage}</div>}

        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <Shield className="mt-0.5 h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-700">
            {t("artistDashboard.orders.privacyNotice")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label={t("artistDashboard.orders.statTotalOrders")} value={stats.total} />
          <Stat label={t("artistDashboard.orders.statPendingPayment")} value={stats.pending} tone="amber" />
          <Stat label={t("artistDashboard.orders.statDelivered")} value={stats.delivered} tone="green" />
          <Stat label={t("artistDashboard.orders.statEstimatedEarnings")} value={`${Math.round(stats.earnings).toLocaleString()} RWF`} tone="teal" />
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={t("artistDashboard.orders.searchPlaceholder")} className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5">
              <option value="all">{t("artistDashboard.orders.filterAllStatus")}</option>
              <option value="pending_payment">{t("artistDashboard.orders.statusPendingPayment")}</option>
              <option value="delivered">{t("artistDashboard.orders.statusDelivered")}</option>
              <option value="cancelled">{t("artistDashboard.orders.statusCancelled")}</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const item = order.items[0];
            // Shared status meta on the customer-facing status: a paid/disbursed
            // order is never mislabelled "Pending Payment", and disbursed shows
            // as "Delivered".
            const status = orderStatusMeta(customerFacingOrderStatus(order.status));
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
                            {t(status.labelKey)}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">{item?.title ?? t("artistDashboard.orders.artworkFallback")}</p>
                        <p className="text-sm text-gray-500">{t("artistDashboard.orders.buyerDetailsManaged")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.totalAmount.toLocaleString()} RWF</p>
                      <p className="text-sm text-green-600">{t("artistDashboard.orders.estPayout", { amount: Math.round(order.totalAmount * 0.8).toLocaleString() })} RWF</p>
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 text-sm text-gray-700">
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />{t("artistDashboard.orders.created", { date: new Date(order.createdAt).toLocaleString() })}</p>
                        <p>{t("artistDashboard.orders.artworkOwner", { owner: item?.ownerType === "renewcanvas" ? "RenewCanvas Africa" : t("artistDashboard.orders.ownerArtist") })}</p>
                        <p>{t("artistDashboard.orders.kgDivertedSnapshot", { kg: item?.kgDiverted.toFixed(1) ?? "0.0" })}</p>
                      </div>
                      <div className="space-y-2 rounded-lg border border-blue-100 bg-white p-4 text-sm text-gray-700">
                        <p className="font-medium text-gray-900">{t("artistDashboard.orders.buyerContact")}</p>
                        <p>{t("artistDashboard.orders.emailLabel", { email: order.buyerContact?.email ?? "—" })}</p>
                        <p>{t("artistDashboard.orders.phoneLabel", { phone: order.buyerContact?.phone ?? "—" })}</p>
                        <p className="flex items-center gap-2 border-t border-gray-100 pt-2 text-gray-700">
                          <Phone className="h-4 w-4 text-teal-600" />
                          <span>{t("artistDashboard.orders.adminContact", { defaultValue: "Admin Contact" })}: <a href={`tel:${ADMIN_CONTACT_PHONE}`} className="font-medium text-teal-700 hover:underline">{ADMIN_CONTACT_PHONE}</a></span>
                        </p>
                        <p className="text-xs text-gray-500">{t("artistDashboard.orders.deliveryHandledByAdmin")}</p>
                        {item?.artworkSlug && (
                          <Link href={`/dashboard/artist/orders/artwork/${item.artworkSlug}`} className="mt-1 inline-flex rounded-lg bg-teal-600 px-4 py-2 text-white">
                            {t("artistDashboard.orders.viewArtwork")}
                          </Link>
                        )}
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
              <h3 className="mb-1 font-medium text-gray-900">{t("artistDashboard.orders.emptyTitle")}</h3>
              <p className="text-gray-500">{t("artistDashboard.orders.emptyMessage")}</p>
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
