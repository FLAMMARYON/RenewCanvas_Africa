"use client";

import { useState, type FormEvent } from "react";
import { XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Order cancellation.
 *
 * A still-pending order is cancelled directly by the owning buyer via
 * `/api/orders/[id]/cancel` (order → cancelled, the reserved artwork is released
 * back to the marketplace + gallery). If that isn't possible — payment already
 * confirmed, or the request isn't from the owning buyer — it falls back to a
 * support request (stored via /api/contact, type "cancellation_request") that
 * the team actions manually.
 */
export function CancellationRequest({
  orderReference,
  buyerEmail = "",
  buyerName = "",
}: {
  orderReference: string;
  buyerEmail?: string;
  buyerName?: string;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    const fd = new FormData(event.currentTarget);
    const name = String(fd.get("name") ?? "").trim() || buyerName || "Buyer";
    const email = String(fd.get("email") ?? "").trim() || buyerEmail;
    const reason = String(fd.get("reason") ?? "").trim();

    if (!email) {
      setStatus({ type: "error", message: t("orderConfirmation.cancelErrEmail") });
      return;
    }
    if (reason.length < 10) {
      setStatus({ type: "error", message: t("orderConfirmation.cancelErrReason") });
      return;
    }

    setSubmitting(true);
    try {
      // First try to cancel the order directly (owning buyer, still pending).
      const cancelResponse = await fetch(`/api/orders/${encodeURIComponent(orderReference)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      if (cancelResponse.ok) {
        setStatus({ type: "success", message: t("orderConfirmation.cancelSuccess") });
        return;
      }

      // Otherwise (already paid / not the owning buyer) fall back to a support
      // request the team actions manually.
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cancellation_request",
          name,
          email,
          subject: `Cancellation request — Order ${orderReference}`,
          message: `Cancellation requested for order ${orderReference}.\nReason: ${reason}`,
          metadata: { orderReference },
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? t("orderConfirmation.cancelErrSubmit"));
      }
      setStatus({
        type: "success",
        message: t("orderConfirmation.cancelSuccess"),
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : t("orderConfirmation.cancelErrGeneric"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">{t("orderConfirmation.cancelHeading")}</h2>
          <p className="text-sm text-gray-500">
            {t("orderConfirmation.cancelDescription")}
          </p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4" />
            {t("orderConfirmation.cancelRequestButton")}
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              name="name"
              defaultValue={buyerName}
              placeholder={t("orderConfirmation.cancelNamePlaceholder")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <input
              name="email"
              type="email"
              defaultValue={buyerEmail}
              placeholder={t("orderConfirmation.cancelEmailPlaceholder")}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <textarea
            name="reason"
            rows={3}
            placeholder={t("orderConfirmation.cancelReasonPlaceholder")}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {status && (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm ${status.type === "success" ? "text-teal-700" : "text-red-600"}`}
            >
              {status.message}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? t("orderConfirmation.cancelSubmitting") : t("orderConfirmation.cancelSubmit")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              {t("orderConfirmation.cancelCancel")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
