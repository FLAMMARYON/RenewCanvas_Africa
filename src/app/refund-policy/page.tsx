"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/brand/renewcanvas-icon-full-color.png" alt="RenewCanvas Africa logo" className="w-8 h-8" />
            <span className="font-bold">
              <span style={{ color: "#0D5C4D" }}>RenewCanvas</span>{" "}
              <span style={{ color: "#F7941D" }}>Africa</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <RotateCcw className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Return & Refund Policy
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: May 1, 2026</span>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-gradient-to-br from-teal-50 to-amber-50 rounded-xl p-6 mb-8 border border-teal-100">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Summary</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">48-Hour Request Window</p>
                  <p className="text-sm text-gray-600">
                    From delivery time for eligible return requests
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Full Refund</p>
                  <p className="text-sm text-gray-600">
                    For damaged or misrepresented items
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Case-by-Case</p>
                  <p className="text-sm text-gray-600">
                    Change of mind returns reviewed individually
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              1. Overview
            </h2>
            <p className="text-gray-600 mb-4">
              At RenewCanvas Africa, we want you to be completely satisfied with
              your purchase. This policy outlines the conditions under which
              returns and refunds are processed. RenewCanvas Africa manages
              payment, delivery communication, return review, and artist payout
              release as the marketplace middleman.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              2. Eligibility for Returns
            </h2>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Eligible for Full Refund
            </h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Damaged in Transit:</strong> Artwork arrives damaged due
                to shipping issues (photos required within 48 hours of delivery)
              </li>
              <li>
                <strong>Significantly Different from Description:</strong> The
                artwork materially differs from the listing (size, materials,
                color discrepancies beyond normal variation)
              </li>
              <li>
                <strong>Wrong Item:</strong> You received an artwork different
                from what was ordered
              </li>
              <li>
                <strong>Not as Represented:</strong> Artwork was misrepresented
                in terms of recycled materials used
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Reviewed Case-by-Case
            </h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Change of Mind:</strong> You no longer want the artwork
                (subject to RenewCanvas admin approval, restocking fee may apply)
              </li>
              <li>
                <strong>Minor Variations:</strong> Small differences inherent to
                handcrafted items
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Not Eligible for Return
            </h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Artwork damaged after delivery due to buyer handling</li>
              <li>
                Custom or commissioned pieces (unless defective)
              </li>
              <li>Return requests opened after 48 hours without prior authorization</li>
              <li>Items with altered or removed artist tags/signatures</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              3. Return Process
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Contact Us</p>
                    <p className="text-sm text-gray-600">
                      Email hello.renewcanvas.africa@gmail.com within 48 hours of delivery
                      with your order number and reason for return
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Provide Documentation</p>
                    <p className="text-sm text-gray-600">
                      Include photos of the artwork and packaging, especially for
                      damage claims
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Await Authorization</p>
                    <p className="text-sm text-gray-600">
                      We will review your request and respond within 2 business
                      days with a Return Authorization (RA) number
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Ship the Artwork</p>
                    <p className="text-sm text-gray-600">
                      Return the artwork in its original packaging with the RA
                      number clearly marked
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    5
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">Receive Refund</p>
                    <p className="text-sm text-gray-600">
                      Once received and inspected, refund will be processed within
                      5-10 business days
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              4. Refund Methods
            </h2>
            <p className="text-gray-600 mb-4">
              Refunds will be issued to the original payment method:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Mobile Money:</strong> Refund credited within 3-5 business
                days
              </li>
              <li>
                <strong>Bank Transfer:</strong> Refund credited within 5-7
                business days
              </li>
              <li>
                <strong>Credit/Debit Card:</strong> Refund processed within 5-10
                business days (may take longer depending on your bank)
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              5. Artist Payout Hold
            </h2>
            <p className="text-gray-600 mb-4">
              Buyer payments are made to RenewCanvas Africa, not directly to the
              artist. RenewCanvas holds the artist payout until 48 hours after
              delivery. If no eligible return request is opened during that
              window, the artist payout is released according to the platform
              payout schedule.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              6. Return Shipping
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Damaged/Wrong Items:</strong> RenewCanvas Africa covers
                return shipping costs
              </li>
              <li>
                <strong>Change of Mind:</strong> Buyer is responsible for return
                shipping costs
              </li>
              <li>
                Artwork must be returned in original packaging to prevent damage
              </li>
              <li>We recommend using tracked shipping for returns</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              7. Restocking Fee
            </h2>
            <p className="text-gray-600 mb-4">
              A restocking fee of up to 15% may apply for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Change of mind returns (if approved by RenewCanvas admin)</li>
              <li>Items returned without original packaging</li>
              <li>Items with minor damage upon return</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              8. Order Cancellations
            </h2>
            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              Before Payment Confirmation
            </h3>
            <p className="text-gray-600 mb-4">
              Orders can be cancelled freely before payment is confirmed. No fees
              apply.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              After Payment, Before Shipping
            </h3>
            <p className="text-gray-600 mb-4">
              Contact us immediately to request cancellation. Full refund will be
              processed if RenewCanvas has not yet released the order for
              shipment.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              After Shipping
            </h3>
            <p className="text-gray-600 mb-4">
              Cancellation is not possible once shipped. You may request a return
              upon delivery following the return process above.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              9. Disputes
            </h2>
            <p className="text-gray-600 mb-4">
              If you are unsatisfied with our decision regarding your return or
              refund request:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                Contact our customer support team to escalate the issue
              </li>
              <li>
                Provide any additional documentation or information
              </li>
              <li>
                A senior team member will review your case within 5 business days
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              10. Exchanges
            </h2>
            <p className="text-gray-600 mb-4">
              Direct exchanges are not available. To obtain a different artwork:
            </p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2 mb-4">
              <li>Follow the return process for the original item</li>
              <li>Place a new order for the desired artwork</li>
            </ol>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              11. Contact Us
            </h2>
            <p className="text-gray-600 mb-4">
              For return and refund inquiries:
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Email:</strong> hello.renewcanvas.africa@gmail.com
              </li>
              <li>
                <strong>Phone:</strong> +250 788 000 000
              </li>
              <li>
                <strong>WhatsApp:</strong> +250 788 000 000
              </li>
              <li>
                <strong>Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM (EAT)
              </li>
            </ul>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/terms"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Terms and Conditions
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/privacy"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/contact"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
