"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Recycle,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  Shield,
  Truck,
  MapPin,
  User,
  Mail,
  Phone,
  Check,
  ChevronRight,
  Palette,
  Lock,
  Info,
} from "lucide-react";
import { saveOrder } from "@/lib/frontend/local-store";

// Mock artwork data - will come from URL params / API
const artwork = {
  id: "1",
  title: "Ocean Waves",
  artist: "Patrick Habimana",
  artistId: "artist-1",
  price: 42000,
  materials: ["PET bottles", "fabric scraps"],
  kgDiverted: 2.5,
  category: "Wall Art",
  dimensions: "60cm x 80cm",
  image: null,
};

type PaymentMethod = "momo" | "bank" | "card";

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const orderId = `ORD-${Date.now()}`;

    saveOrder({
      id: orderId,
      artworkId: artwork.id,
      artworkTitle: artwork.title,
      amount: artwork.price,
      customer: formData,
      paymentMethod,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    });

    setIsSubmitting(false);
    router.push(`/order-confirmation?order=${orderId}`);
  };

  const paymentMethods = [
    {
      id: "momo" as PaymentMethod,
      name: "MTN Mobile Money",
      description: "Pay with your MTN MoMo account",
      icon: Smartphone,
      instructions:
        "You will receive payment instructions via SMS after submitting your order.",
    },
    {
      id: "bank" as PaymentMethod,
      name: "Bank Transfer",
      description: "Transfer directly to our bank account",
      icon: Building2,
      instructions:
        "Bank details will be provided after order submission. Payment must be completed within 48 hours.",
    },
    {
      id: "card" as PaymentMethod,
      name: "Card Payment",
      description: "Pay with Visa, Mastercard via Flutterwave",
      icon: CreditCard,
      instructions:
        "You will be redirected to a secure payment page to complete your transaction.",
    },
  ];

  const selectedPaymentMethod = paymentMethods.find(
    (m) => m.id === paymentMethod
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/marketplace"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Marketplace</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Recycle className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">
              Renew<span className="text-teal-600">Canvas</span> <span className="text-amber-500">Africa</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: "Details" },
              { num: 2, label: "Payment" },
              { num: 3, label: "Confirm" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center gap-2 ${
                    step >= s.num ? "text-teal-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                      step > s.num
                        ? "bg-teal-600 text-white"
                        : step === s.num
                        ? "bg-teal-100 text-teal-600 border-2 border-teal-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <ChevronRight className="w-5 h-5 mx-2 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Contact & Delivery Details */}
              {step === 1 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Contact & Delivery Details
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone / WhatsApp
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+250 xxx xxx xxx"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Street address, building, etc."
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g., Kigali"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Order Notes{" "}
                        <span className="text-gray-400">(Optional)</span>
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any special instructions for delivery..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Continue to Payment
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Payment Method */}
              {step === 2 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Select Payment Method
                  </h2>

                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === method.id
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            paymentMethod === method.id
                              ? "bg-teal-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <method.icon
                            className={`w-6 h-6 ${
                              paymentMethod === method.id
                                ? "text-teal-600"
                                : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {method.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {method.description}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === method.id
                              ? "border-teal-600"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === method.id && (
                            <div className="w-3 h-3 rounded-full bg-teal-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Payment Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">
                          How it works
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          {selectedPaymentMethod?.instructions}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                      Review Order
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Confirm */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Order Review */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                      Review Your Order
                    </h2>

                    {/* Delivery Details */}
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          Delivery Details
                        </h3>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-sm text-teal-600 hover:text-teal-700"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium text-gray-900">
                          {formData.fullName}
                        </p>
                        <p>{formData.email}</p>
                        <p>{formData.phone}</p>
                        <p>
                          {formData.address}, {formData.city}
                        </p>
                        {formData.notes && (
                          <p className="text-gray-500 italic">
                            Note: {formData.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          Payment Method
                        </h3>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-sm text-teal-600 hover:text-teal-700"
                        >
                          Change
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedPaymentMethod && (
                          <>
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <selectedPaymentMethod.icon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {selectedPaymentMethod.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {selectedPaymentMethod.description}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        className="w-5 h-5 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-600">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-teal-600 hover:underline"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/refund-policy"
                          className="text-teal-600 hover:underline"
                        >
                          Refund Policy
                        </Link>
                        . I understand that I will receive payment instructions
                        after submitting this order.
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Artwork */}
              <div className="flex gap-4 pb-4 border-b border-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-50 to-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Palette className="w-8 h-8 text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {artwork.title}
                  </h3>
                  <p className="text-sm text-gray-500">by {artwork.artist}</p>
                  <p className="text-sm text-gray-400">{artwork.dimensions}</p>
                </div>
              </div>

              {/* Materials */}
              <div className="py-4 border-b border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Materials Used</p>
                <div className="flex flex-wrap gap-1">
                  {artwork.materials.map((material) => (
                    <span
                      key={material}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              {/* Impact */}
              <div className="py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-green-600">
                  <Recycle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {artwork.kgDiverted} kg waste diverted
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="py-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Artwork Price</span>
                  <span className="text-gray-900">
                    {artwork.price.toLocaleString()} RWF
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="text-gray-900">To be calculated</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {artwork.price.toLocaleString()} RWF
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  + delivery (calculated at confirmation)
                </p>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Truck className="w-4 h-4 text-green-500" />
                  <span>Careful packaging & delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Recycle className="w-4 h-4 text-green-500" />
                  <span>Verified impact tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
