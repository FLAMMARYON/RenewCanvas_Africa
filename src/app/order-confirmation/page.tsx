"use client";

import Link from "next/link";
import {
  CheckCircle,
  Recycle,
  ArrowRight,
  Copy,
  Mail,
  Phone,
  Clock,
  Package,
  Smartphone,
  Building2,
  CreditCard,
  Home,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

// Mock order data - will come from API
const orderData = {
  orderId: "ORD-1714579200000",
  artwork: {
    title: "Ocean Waves",
    artist: "Patrick Habimana",
    price: 42000,
    kgDiverted: 2.5,
  },
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+250 788 123 456",
    address: "KG 123 St, Kimironko",
    city: "Kigali",
  },
  paymentMethod: "momo",
  status: "pending_payment",
  createdAt: new Date().toISOString(),
};

const paymentInstructions = {
  momo: {
    title: "MTN MoMo Phone Approval",
    icon: Smartphone,
    steps: [
      "Keep your MTN Mobile Money phone nearby",
      "Open the RenewCanvas Africa payment prompt when it arrives",
      `Confirm Amount: ${orderData.artwork.price.toLocaleString()} RWF`,
      `Confirm Reference: ${orderData.orderId}`,
      "Enter your MoMo PIN on your phone to approve",
      "Wait for RenewCanvas Africa payment confirmation",
    ],
    note: "Payment goes to RenewCanvas Africa. If the phone approval prompt does not arrive, support can provide the fallback USSD path: dial *182*8*1#, select Pay Bill, enter merchant code 123456, and use your order reference.",
  },
  bank: {
    title: "Bank Transfer Details",
    icon: Building2,
    steps: [
      "Bank: Bank of Kigali",
      "Account Name: RenewCanvas Africa Ltd",
      "Account Number: 1234567890",
      `Amount: ${orderData.artwork.price.toLocaleString()} RWF`,
      `Reference: ${orderData.orderId}`,
    ],
    note: "Please complete the transfer within 48 hours. Send proof of payment to payments@renewcanvas.africa",
  },
  card: {
    title: "Card Payment",
    icon: CreditCard,
    steps: [
      "Click the payment link sent to your email",
      "Enter your card details securely",
      "Complete the 3D Secure verification",
      "Receive instant confirmation",
    ],
    note: "A secure RenewCanvas Africa payment link has been sent to your email address.",
  },
};

export default function OrderConfirmationPage() {
  const [copied, setCopied] = useState(false);
  const instructions =
    paymentInstructions[
      orderData.paymentMethod as keyof typeof paymentInstructions
    ];

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderData.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Recycle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">
              Renew<span className="text-teal-600">Canvas</span> <span className="text-amber-500">Africa</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Thank you for your order. Please complete the payment to secure your
            artwork. RenewCanvas Africa receives the payment and manages the
            order between you and the artist.
          </p>
        </div>

        {/* Order ID */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-mono font-bold text-gray-900">
                  {orderData.orderId}
                </p>
                <button
                  onClick={copyOrderId}
                  className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors"
                  title="Copy order ID"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Awaiting Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Payment Instructions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <instructions.icon className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {instructions.title}
                </h2>
                <p className="text-sm text-gray-500">
                  Complete payment to RenewCanvas Africa
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {instructions.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-teal-600">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-700">{instructions.note}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Order Details</h2>

            {/* Artwork */}
            <div className="flex gap-4 pb-4 border-b border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-teal-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {orderData.artwork.title}
                </h3>
                <p className="text-sm text-gray-500">
                  by {orderData.artwork.artist}
                </p>
                <p className="font-semibold text-gray-900 mt-1">
                  {orderData.artwork.price.toLocaleString()} RWF
                </p>
              </div>
            </div>

            {/* Impact */}
            <div className="py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-green-600">
                <Recycle className="w-5 h-5" />
                <span className="font-medium">
                  {orderData.artwork.kgDiverted} kg of waste will be diverted
                </span>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Delivery To
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium text-gray-900">
                  {orderData.customer.name}
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{orderData.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{orderData.customer.phone}</span>
                </div>
                <p className="text-gray-500 mt-2">
                  {orderData.customer.address}, {orderData.customer.city}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className="bg-gradient-to-br from-teal-50 to-amber-50 rounded-xl p-6 mt-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            What Happens Next?
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white/70 rounded-lg p-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                <span className="font-bold text-teal-600">1</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                Complete Payment
              </h3>
              <p className="text-sm text-gray-600">
                Follow the instructions above to pay RenewCanvas Africa
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                <span className="font-bold text-amber-600">2</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                Order Confirmed
              </h3>
              <p className="text-sm text-gray-600">
                We verify payment, notify the artist, and coordinate delivery
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                <span className="font-bold text-green-600">3</span>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                Return Window
              </h3>
              <p className="text-sm text-gray-600">
                After delivery, artist payout is released only if no return
                request is opened within 48 hours
              </p>
            </div>
          </div>
        </div>

        {/* Need Help */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
          <h2 className="font-semibold text-gray-900 mb-4">Need Help?</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:support@renewcanvas.africa"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <a
              href="https://wa.me/250788000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href="tel:+250788000000"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Us
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/dashboard/buyer/orders"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <ShoppingBag className="w-5 h-5" />
            View My Orders
          </Link>
          <Link
            href="/marketplace"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
