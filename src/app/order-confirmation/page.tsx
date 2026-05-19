"use client";

import Link from "next/link";
import { ArrowRight, Building2, CheckCircle, Copy, CreditCard, Home, Mail, Package, Phone, Recycle, ShoppingBag, Smartphone } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { readOrder, type FrontendOrder } from "@/lib/frontend/orders-api";
import { listPaymentSessions, type FrontendPayment } from "@/lib/frontend/payments-api";

const instructionMeta = {
  momo: { title: "MTN MoMo Phone Approval", icon: Smartphone },
  bank: { title: "Bank Transfer Details", icon: Building2 },
  card: { title: "Card Payment", icon: CreditCard },
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<OrderConfirmationLoading />}>
      <OrderConfirmationContent />
    </Suspense>
  );
}

function OrderConfirmationLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
    </main>
  );
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<FrontendOrder | null>(null);
  const [payment, setPayment] = useState<FrontendPayment | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get("order");
    if (!orderId) {
      setStatusMessage("Order reference is missing.");
      return;
    }
    Promise.all([readOrder(orderId), listPaymentSessions(orderId)])
      .then(([nextOrder, payments]) => {
        setOrder(nextOrder);
        const paymentId = searchParams.get("payment");
        setPayment(payments.find((item) => item.id === paymentId) ?? payments[0] ?? null);
      })
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load order."));
  }, [searchParams]);

  const item = order?.items[0];
  const instructions = useMemo(() => {
    if (!order || !item) return null;
    const meta = instructionMeta[order.paymentMethod as keyof typeof instructionMeta] ?? instructionMeta.momo;
    const amount = `${order.totalAmount.toLocaleString()} RWF`;
    const steps =
      order.paymentMethod === "bank"
        ? ["Bank: Bank of Kigali", "Account Name: RenewCanvas Africa Ltd", "Account Number: 1234567890", `Amount: ${amount}`, `Reference: ${payment?.providerReference ?? order.id}`]
        : order.paymentMethod === "card"
        ? [payment?.checkoutUrl ? `Open payment link: ${payment.checkoutUrl}` : "Open the payment link sent to your email", "Enter your card details securely", "Complete the 3D Secure verification", "Receive confirmation from RenewCanvas Africa"]
        : ["Keep your MTN Mobile Money phone nearby", "Open the RenewCanvas Africa payment prompt when it arrives", `Confirm Amount: ${amount}`, `Confirm Reference: ${payment?.providerReference ?? order.id}`, payment?.ussdReference ? `USSD fallback reference: ${payment.ussdReference}` : "Enter your MoMo PIN to approve"];
    return {
      ...meta,
      steps,
      note:
        order.paymentMethod === "bank"
          ? "Please complete the transfer within 48 hours. Send proof of payment to hello.renewcanvas.africa@gmail.com."
          : "Payment goes to RenewCanvas Africa. Admins confirm payment and coordinate delivery with the artist.",
    };
  }, [order, item, payment]);

  const copyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (statusMessage && !order) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          {statusMessage}
          <Link href="/marketplace" className="mt-4 block font-medium text-teal-700">Back to marketplace</Link>
        </div>
      </main>
    );
  }

  if (!order || !item || !instructions) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </main>
    );
  }

  const delivery = order.deliveryAddress ?? {};
  const InstructionsIcon = instructions.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/brand/renewcanvas-icon-full-color.png"
              alt="RenewCanvas Africa logo"
              className="w-8 h-8"
            />
            <span className="font-bold">
              <span style={{ color: "#0D5C4D" }}>RenewCanvas</span>{" "}
              <span style={{ color: "#F7941D" }}>Africa</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Order Placed Successfully</h1>
          <p className="mx-auto max-w-lg text-gray-600">Complete payment to secure your artwork. RenewCanvas Africa receives payment and manages delivery communication.</p>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-sm text-gray-500">Order ID</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-lg font-bold text-gray-900">{order.id}</p>
                <button onClick={copyOrderId} className="p-1.5 text-gray-400 hover:text-teal-600" title="Copy order ID">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="rounded-lg bg-amber-50 px-4 py-2 font-medium text-amber-700">Awaiting Payment</div>
          </div>
          {payment && (
            <div className="mt-4 grid gap-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-gray-500">Payment Status</p>
                <p className="font-medium text-gray-900">{payment.status.replaceAll("_", " ")}</p>
              </div>
              <div>
                <p className="text-gray-500">Provider Reference</p>
                <p className="font-mono font-medium text-gray-900">{payment.providerReference ?? "Pending"}</p>
              </div>
              <div>
                <p className="text-gray-500">USSD Fallback</p>
                <p className="font-mono font-medium text-gray-900">{payment.ussdReference ?? "Not required"}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
                <InstructionsIcon className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{instructions.title}</h2>
                <p className="text-sm text-gray-500">Complete payment to RenewCanvas Africa</p>
              </div>
            </div>
            <div className="mb-6 space-y-3">
              {instructions.steps.map((step, index) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-medium text-teal-600">{index + 1}</span>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">{instructions.note}</div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-6 font-semibold text-gray-900">Order Details</h2>
            <div className="flex gap-4 border-b border-gray-100 pb-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50">
                <Package className="h-8 w-8 text-teal-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">by {item.artistName}</p>
                <p className="mt-1 font-semibold text-gray-900">{item.unitAmount.toLocaleString()} RWF</p>
              </div>
            </div>
            <div className="border-b border-gray-100 py-4 text-green-600">
              <Recycle className="mr-2 inline h-5 w-5" />
              {item.kgDiverted.toFixed(1)} kg of waste diverted
            </div>
            <div className="pt-4 text-sm text-gray-700">
              <h3 className="mb-3 text-sm font-medium text-gray-500">Delivery To</h3>
              <p className="font-medium text-gray-900">{String(delivery.fullName ?? "")}</p>
              <p>{String(delivery.email ?? "")}</p>
              <p>{String(delivery.phone ?? "")}</p>
              <p className="mt-2 text-gray-500">{String(delivery.address ?? "")}, {String(delivery.city ?? "")}</p>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href="/dashboard/buyer/orders" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-3 font-medium text-white hover:bg-teal-700">
            <ShoppingBag className="h-5 w-5" />
            View My Orders
          </Link>
          <Link href="/marketplace" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">
            Continue Shopping
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/" className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-semibold text-gray-900">Need Help?</h2>
          <a href="mailto:hello.renewcanvas.africa@gmail.com" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50">
            <Mail className="h-4 w-4" />
            Email Support
          </a>
          <a href="tel:+250788000000" className="ml-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50">
            <Phone className="h-4 w-4" />
            Call Us
          </a>
        </div>
      </main>
    </div>
  );
}
