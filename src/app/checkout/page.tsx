"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { readArtwork, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { createOrder } from "@/lib/frontend/orders-api";
import { createPaymentSession } from "@/lib/frontend/payments-api";

type PaymentMethod = "momo" | "bank" | "card";
type CheckoutField = "fullName" | "email" | "phone" | "address" | "city" | "paymentMethod" | "termsAccepted";
type CheckoutErrors = Partial<Record<CheckoutField, string>>;

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
    </main>
  );
}

function validateField(
  field: CheckoutField,
  formData: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    notes: string;
  },
  paymentMethod: PaymentMethod | "",
  termsAccepted: boolean
) {
  if (field === "fullName") {
    const value = formData.fullName.trim();
    if (!value) return "Full name is required.";
    if (value.length < 2) return "Full name must be at least 2 characters.";
    return "";
  }

  if (field === "email") {
    const value = formData.email.trim();
    if (!value) return "Email address is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address.";
    return "";
  }

  if (field === "phone") {
    const value = formData.phone.replace(/[\s-]/g, "");
    if (!value) return "Phone number is required.";
    if (!/^(\+2507\d{8}|07\d{8})$/.test(value)) {
      return "Enter a valid Rwanda phone number, e.g. +2507XXXXXXXX or 07XXXXXXXX.";
    }
    return "";
  }

  if (field === "address") {
    if (!formData.address.trim()) return "Delivery address is required.";
    return "";
  }

  if (field === "city") {
    if (!formData.city.trim()) return "City is required.";
    return "";
  }

  if (field === "paymentMethod") {
    if (!paymentMethod) return "Select a payment method.";
    return "";
  }

  if (field === "termsAccepted") {
    if (!termsAccepted) return "You must accept the terms and refund policy.";
    return "";
  }

  return "";
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [artwork, setArtwork] = useState<FrontendArtwork | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [touched, setTouched] = useState<Partial<Record<CheckoutField, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fieldRefs = useRef<Partial<Record<CheckoutField, HTMLElement | null>>>({});

  useEffect(() => {
    const artworkId = searchParams.get("artworkId");
    if (!artworkId) {
      setStatusMessage("Choose an artwork before checkout.");
      return;
    }
    readArtwork(artworkId)
      .then(setArtwork)
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load artwork for checkout."));
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const field = e.target.name as keyof typeof formData;
    const nextFormData = { ...formData, [field]: e.target.value };
    setFormData(nextFormData);
    if (touched[field as CheckoutField]) {
      setErrors((current) => ({
        ...current,
        [field]: validateField(field as CheckoutField, nextFormData, paymentMethod, termsAccepted),
      }));
    }
  };

  const handleBlur = (field: CheckoutField) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({
      ...current,
      [field]: validateField(field, formData, paymentMethod, termsAccepted),
    }));
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setTouched((current) => ({ ...current, paymentMethod: true }));
    setErrors((current) => ({ ...current, paymentMethod: "" }));
  };

  const handleTermsChange = (checked: boolean) => {
    setTermsAccepted(checked);
    if (touched.termsAccepted) {
      setErrors((current) => ({
        ...current,
        termsAccepted: validateField("termsAccepted", formData, paymentMethod, checked),
      }));
    }
  };

  const validateCheckout = (fields: CheckoutField[]) => {
    const nextErrors = fields.reduce<CheckoutErrors>((acc, field) => {
      const message = validateField(field, formData, paymentMethod, termsAccepted);
      if (message) acc[field] = message;
      return acc;
    }, {});
    return nextErrors;
  };

  const focusFirstInvalid = (fieldOrder: CheckoutField[], nextErrors: CheckoutErrors) => {
    const firstInvalid = fieldOrder.find((field) => nextErrors[field]);
    if (!firstInvalid) return;
    const element = fieldRefs.current[firstInvalid];
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
    element?.focus({ preventScroll: true });
  };

  const validateAndFocus = (fields: CheckoutField[]) => {
    const nextErrors = validateCheckout(fields);
    setTouched((current) => ({
      ...current,
      ...fields.reduce<Partial<Record<CheckoutField, boolean>>>((acc, field) => {
        acc[field] = true;
        return acc;
      }, {}),
    }));
    setErrors((current) => ({ ...current, ...nextErrors }));
    focusFirstInvalid(fields, nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const stepOneFields: CheckoutField[] = ["fullName", "email", "phone", "address", "city"];
  const allRequiredFields: CheckoutField[] = [...stepOneFields, "paymentMethod", "termsAccepted"];
  const stepOneValid = useMemo(() => Object.keys(validateCheckout(stepOneFields)).length === 0, [formData, paymentMethod, termsAccepted]);
  const paymentValid = useMemo(() => Object.keys(validateCheckout(["paymentMethod"])).length === 0, [formData, paymentMethod, termsAccepted]);
  const checkoutValid = useMemo(() => Object.keys(validateCheckout(allRequiredFields)).length === 0, [formData, paymentMethod, termsAccepted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artwork) return;
    if (!validateAndFocus(allRequiredFields)) return;
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const order = await createOrder({
        artworkId: artwork.id,
        deliveryAddress: formData,
        notes: formData.notes,
        paymentMethod,
      });
      const payment = await createPaymentSession({
        orderId: order.id,
        provider: paymentMethod === "card" ? "stripe" : paymentMethod === "bank" ? "manual_bank" : "mtn_momo",
        momoPhone: formData.phone,
        idempotencyKey: `checkout:${order.id}:${paymentMethod}`,
      });
      router.push(`/order-confirmation?order=${encodeURIComponent(order.id)}&payment=${encodeURIComponent(payment.id)}`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not place order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (statusMessage && !artwork) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-24">
        <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          {statusMessage}
          <Link href="/marketplace" className="mt-4 block font-medium text-teal-700">Back to marketplace</Link>
        </div>
      </main>
    );
  }

  if (!artwork) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </main>
    );
  }

  const paymentMethods = [
    {
      id: "momo" as PaymentMethod,
      name: "MTN MoMo Phone Approval",
      description:
        "Pay RenewCanvas Africa by approving the MoMo prompt on your phone",
      icon: Smartphone,
      instructions:
        "After submitting your order, RenewCanvas Africa will send a MoMo approval prompt to your phone. Confirm it with your PIN to complete payment. If the prompt is unavailable, support will provide USSD fallback details tied to your order reference.",
    },
    {
      id: "bank" as PaymentMethod,
      name: "Bank Transfer",
      description: "Transfer to the RenewCanvas Africa holding account",
      icon: Building2,
      instructions:
        "RenewCanvas Africa bank details will be provided after order submission. Payment must be completed within 48 hours.",
    },
    {
      id: "card" as PaymentMethod,
      name: "Card Payment",
      description: "Pay RenewCanvas Africa with Visa or Mastercard",
      icon: CreditCard,
      instructions:
        "You will be redirected to a secure RenewCanvas Africa payment page to complete your transaction.",
    },
  ];

  const selectedPaymentMethod = paymentMethods.find(
    (m) => m.id === paymentMethod
  );

  const fieldClass = (field: CheckoutField, baseClass: string) =>
    `${baseClass} ${touched[field] && errors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`;

  const errorText = (field: CheckoutField) =>
    touched[field] && errors[field] ? (
      <p className="mt-1 text-sm text-red-600">{errors[field]}</p>
    ) : null;

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
            <img src="/brand/renewcanvas-icon-full-color.png" alt="RenewCanvas Africa logo" className="w-8 h-8" />
            <span className="font-bold">
              <span style={{ color: "#0D5C4D" }}>RenewCanvas</span>{" "}
              <span style={{ color: "#F7941D" }}>Africa</span>
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
        {statusMessage && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {statusMessage}
          </div>
        )}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} noValidate>
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
                          ref={(element) => {
                            fieldRefs.current.fullName = element;
                          }}
                          value={formData.fullName}
                          onChange={handleChange}
                          onBlur={() => handleBlur("fullName")}
                          placeholder="Enter your full name"
                          className={fieldClass("fullName", "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none")}
                        />
                      </div>
                      {errorText("fullName")}
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
                          ref={(element) => {
                            fieldRefs.current.email = element;
                          }}
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={() => handleBlur("email")}
                          placeholder="you@example.com"
                          className={fieldClass("email", "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none")}
                        />
                      </div>
                        {errorText("email")}
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
                          ref={(element) => {
                            fieldRefs.current.phone = element;
                          }}
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={() => handleBlur("phone")}
                          placeholder="+250 xxx xxx xxx"
                          className={fieldClass("phone", "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none")}
                        />
                      </div>
                        {errorText("phone")}
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
                          ref={(element) => {
                            fieldRefs.current.address = element;
                          }}
                          value={formData.address}
                          onChange={handleChange}
                          onBlur={() => handleBlur("address")}
                          placeholder="Street address, building, etc."
                          className={fieldClass("address", "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none")}
                        />
                      </div>
                      {errorText("address")}
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        ref={(element) => {
                          fieldRefs.current.city = element;
                        }}
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={() => handleBlur("city")}
                        placeholder="e.g., Kigali"
                        className={fieldClass("city", "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none")}
                      />
                      {errorText("city")}
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
                    onClick={() => {
                      if (validateAndFocus(stepOneFields)) setStep(2);
                    }}
                    disabled={!stepOneValid}
                    className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                        ref={method.id === "momo" ? (element) => {
                          fieldRefs.current.paymentMethod = element;
                        } : undefined}
                        onBlur={() => handleBlur("paymentMethod")}
                        onClick={() => handlePaymentSelect(method.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === method.id
                            ? "border-teal-500 bg-teal-50"
                            : touched.paymentMethod && errors.paymentMethod
                            ? "border-red-500 hover:border-red-500"
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
                  {errorText("paymentMethod")}

                  {/* Payment Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">
                          RenewCanvas managed payment
                        </p>
                        <p className="text-sm text-blue-700 mt-1">
                          {selectedPaymentMethod?.instructions}
                        </p>
                        <p className="text-sm text-blue-700 mt-2">
                          Buyers pay RenewCanvas Africa directly. We confirm the
                          order, coordinate delivery, and release the artist
                          payout only after the 48-hour return request window
                          closes without an approved return.
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
                      onClick={() => {
                        if (validateAndFocus(["paymentMethod"])) setStep(3);
                      }}
                      disabled={!paymentValid}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                        ref={(element) => {
                          fieldRefs.current.termsAccepted = element;
                        }}
                        checked={termsAccepted}
                        onChange={(event) => handleTermsChange(event.target.checked)}
                        onBlur={() => handleBlur("termsAccepted")}
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
                        . I understand that RenewCanvas Africa will send payment
                        instructions after submitting this order, manages payment
                        and delivery communication, and releases artist payouts
                        after the return request window.
                      </span>
                    </label>
                    {errorText("termsAccepted")}
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
                      disabled={isSubmitting || !checkoutValid}
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
                  <p className="text-sm text-gray-500">by {artwork.artist?.name ?? "RenewCanvas Africa"}</p>
                  <p className="text-sm text-gray-400">{artwork.dimensions}</p>
                </div>
              </div>

              {/* Materials */}
              <div className="py-4 border-b border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Materials Used</p>
                <div className="flex flex-wrap gap-1">
                  {artwork.materials.map((material) => (
                    <span
                      key={material.id}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      {material.material}
                    </span>
                  ))}
                </div>
              </div>

              {/* Impact */}
              <div className="py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-green-600">
                  <Recycle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {artwork.kgDiverted.toFixed(1)} kg waste diverted
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="py-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Artwork Price</span>
                  <span className="text-gray-900">
                    {artwork.priceAmount.toLocaleString()} RWF
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
                    {artwork.priceAmount.toLocaleString()} RWF
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
                  <span>RenewCanvas receives and holds buyer payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Truck className="w-4 h-4 text-green-500" />
                  <span>Admin-mediated delivery communication</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Recycle className="w-4 h-4 text-green-500" />
                  <span>Artist payout after 48-hour return window</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
