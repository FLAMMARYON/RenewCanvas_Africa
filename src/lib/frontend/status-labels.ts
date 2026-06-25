/**
 * Single source of truth for artwork + order status display.
 *
 * Every admin/dashboard page that renders a status chip MUST resolve it through
 * `artworkStatusMeta()` / `orderStatusMeta()` instead of hardcoding labels or
 * keeping a private per-page map. This guarantees an approved/sold artwork is
 * never mislabelled as "Pending Review" (the old per-page fallback bug), and
 * that colours/icons stay consistent across the dashboard.
 *
 * `labelKey` points at the `statusLabels.*` i18n namespace (en.json is the
 * canonical copy; other locales fall back to English via fallbackLng="en").
 */
import {
  Archive,
  Banknote,
  CheckCircle,
  Clock,
  FileText,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type StatusMeta = {
  labelKey: string;
  color: string;
  bgColor: string;
  icon: LucideIcon;
};

/** ArtworkStatus enum → display meta. Mirrors prisma `ArtworkStatus`. */
export const ARTWORK_STATUS_META: Record<string, StatusMeta> = {
  draft: { labelKey: "statusLabels.draft", color: "text-gray-600", bgColor: "bg-gray-100", icon: FileText },
  submitted: { labelKey: "statusLabels.submitted", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  under_review: { labelKey: "statusLabels.underReview", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  approved: { labelKey: "statusLabels.approved", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  listed: { labelKey: "statusLabels.listed", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  rejected: { labelKey: "statusLabels.rejected", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
  reserved: { labelKey: "statusLabels.reserved", color: "text-blue-600", bgColor: "bg-blue-50", icon: Clock },
  sold: { labelKey: "statusLabels.sold", color: "text-purple-600", bgColor: "bg-purple-50", icon: CheckCircle },
  archived: { labelKey: "statusLabels.archived", color: "text-gray-600", bgColor: "bg-gray-100", icon: Archive },
};

/** OrderStatus enum → display meta. Mirrors prisma `OrderStatus` (+ artist_paid). */
export const ORDER_STATUS_META: Record<string, StatusMeta> = {
  pending_payment: { labelKey: "statusLabels.pendingPayment", color: "text-amber-600", bgColor: "bg-amber-50", icon: Clock },
  paid: { labelKey: "statusLabels.paid", color: "text-blue-600", bgColor: "bg-blue-50", icon: CheckCircle },
  processing: { labelKey: "statusLabels.processing", color: "text-blue-600", bgColor: "bg-blue-50", icon: CheckCircle },
  shipped: { labelKey: "statusLabels.shipped", color: "text-purple-600", bgColor: "bg-purple-50", icon: Truck },
  delivered: { labelKey: "statusLabels.delivered", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle },
  artist_paid: { labelKey: "statusLabels.artistPaid", color: "text-teal-600", bgColor: "bg-teal-50", icon: Banknote },
  cancelled: { labelKey: "statusLabels.cancelled", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
  refunded: { labelKey: "statusLabels.refunded", color: "text-gray-600", bgColor: "bg-gray-100", icon: XCircle },
  failed: { labelKey: "statusLabels.failed", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
};

const UNKNOWN_META: StatusMeta = {
  labelKey: "statusLabels.unknown",
  color: "text-gray-600",
  bgColor: "bg-gray-100",
  icon: FileText,
};

/** Resolve artwork status → meta. Unknown statuses get a neutral chip, never "Pending Review". */
export function artworkStatusMeta(status: string): StatusMeta {
  return ARTWORK_STATUS_META[status] ?? UNKNOWN_META;
}

/** Resolve order status → meta. Unknown statuses get a neutral chip, never "Pending Payment". */
export function orderStatusMeta(status: string): StatusMeta {
  return ORDER_STATUS_META[status] ?? UNKNOWN_META;
}

/**
 * Customer/artist-facing order status. The internal `artist_paid` (disbursed)
 * settlement step is shown to both the artist and the buyer as "Delivered" — the
 * order is complete from their perspective. Everything else maps 1:1. Pair with
 * `orderStatusMeta` so a paid/disbursed order is never mislabelled "Pending
 * Payment".
 */
export function customerFacingOrderStatus(status: string): string {
  return status === "artist_paid" ? "delivered" : status;
}

/**
 * Order statuses that represent money actually received by RenewCanvas.
 * Revenue must be summed ONLY over these — pending/cancelled/refunded/failed
 * orders are excluded. `artist_paid` is still confirmed revenue (the buyer paid;
 * the artist has since been disbursed).
 */
export const CONFIRMED_REVENUE_STATUSES = ["paid", "processing", "shipped", "delivered", "artist_paid"] as const;

/** True if the order's payment has been confirmed (buyer → RenewCanvas). */
export function isConfirmedRevenueStatus(status: string): boolean {
  return (CONFIRMED_REVENUE_STATUSES as readonly string[]).includes(status);
}

/**
 * Settlement implication for orders. Reaching `artist_paid` (the artist has been
 * disbursed) means the order has, by definition, already been **paid** by the
 * buyer AND **delivered** — `artist_paid` is the terminal state of the manual
 * settlement workflow (pending_payment → paid → artist_paid), which never sets a
 * separate `delivered` row. The transition is one-way: an order can only become
 * `artist_paid` from `paid` (enforced in `disburseOrderToArtists`).
 *
 * Centralising the relationship here keeps admin — and any future view —
 * consistent instead of scattering `=== "artist_paid"` checks across pages. The
 * map lists, for each logical status, every concrete order status that satisfies
 * it: `paid`/`delivered` therefore also include `artist_paid`, and selecting the
 * `artist_paid` filter matches paid, delivered, and artist_paid.
 */
const ORDER_STATUS_SATISFIED_BY: Record<string, readonly string[]> = {
  paid: ["paid", "artist_paid"],
  delivered: ["delivered", "artist_paid"],
  artist_paid: ["paid", "delivered", "artist_paid"],
};

/**
 * Whether an order with `status` satisfies the logical `target` status — used by
 * status filters and stat tallies so the `artist_paid ⇒ paid + delivered`
 * implication is applied uniformly. Statuses with no implication mapping
 * (pending_payment, cancelled, refunded, failed) fall back to strict equality.
 */
export function orderStatusSatisfies(status: string, target: string): boolean {
  if (status === target) return true;
  return ORDER_STATUS_SATISFIED_BY[target]?.includes(status) ?? false;
}
