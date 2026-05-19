"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Calendar } from "lucide-react";

export default function TermsPage() {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Terms and Conditions
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: May 1, 2026</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-600 mb-4">
              Welcome to RenewCanvas Africa (&quot;Platform&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;). These Terms
              and Conditions govern your use of our platform and services. By
              accessing or using RenewCanvas Africa, you agree to be bound by
              these terms.
            </p>
            <p className="text-gray-600 mb-4">
              RenewCanvas Africa is a circular economy marketplace connecting
              artists who create sustainable art from recycled materials with
              buyers who appreciate eco-conscious art.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              2. Definitions
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>&quot;Artist&quot;</strong> refers to registered users who create
                and sell artwork on the platform.
              </li>
              <li>
                <strong>&quot;Buyer&quot;</strong> refers to registered users who purchase
                artwork through the platform.
              </li>
              <li>
                <strong>&quot;Artwork&quot;</strong> refers to any art piece created from
                recycled or upcycled materials listed for sale on the platform.
              </li>
              <li>
                <strong>&quot;Services&quot;</strong> refers to all features and
                functionalities provided by RenewCanvas Africa.
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              3. Account Registration
            </h2>
            <p className="text-gray-600 mb-4">
              To use our services, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              4. Artist Responsibilities
            </h2>
            <p className="text-gray-600 mb-4">As an artist on RenewCanvas Africa, you agree to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                Create original artwork using recycled or upcycled materials
              </li>
              <li>
                Accurately describe your artwork, including materials used and
                dimensions
              </li>
              <li>
                Provide truthful information about the environmental impact of
                your materials
              </li>
              <li>Fulfill orders within the agreed timeframe</li>
              <li>Package artwork safely for delivery</li>
              <li>
                Maintain the quality standards required by the platform
              </li>
              <li>Respond to buyer inquiries promptly</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              5. Buyer Responsibilities
            </h2>
            <p className="text-gray-600 mb-4">As a buyer on RenewCanvas Africa, you agree to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Provide accurate delivery information</li>
              <li>Complete payment as agreed</li>
              <li>Inspect artwork upon delivery and report issues promptly</li>
              <li>Respect the intellectual property rights of artists</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              6. Pricing and Payments
            </h2>
            <p className="text-gray-600 mb-4">
              All prices are displayed in Rwandan Francs (RWF). We accept the
              following payment methods:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>MTN Mobile Money phone approval, with USSD fallback</li>
              <li>Bank Transfer</li>
              <li>Credit/Debit Cards (via Flutterwave)</li>
            </ul>
            <p className="text-gray-600 mb-4">
              <strong>Commission Structure:</strong> RenewCanvas Africa retains
              20% of each sale as a platform fee. Artists receive 80% of the sale
              price.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              7. Intellectual Property
            </h2>
            <p className="text-gray-600 mb-4">
              Artists retain full intellectual property rights to their artwork.
              By listing artwork on our platform, artists grant RenewCanvas Africa
              a non-exclusive license to display and promote their work.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              8. Content Guidelines
            </h2>
            <p className="text-gray-600 mb-4">All content on the platform must:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Be original or properly licensed</li>
              <li>Not infringe on any third-party rights</li>
              <li>Not contain offensive, harmful, or illegal content</li>
              <li>Accurately represent the artwork being sold</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              9. Shipping and Delivery
            </h2>
            <p className="text-gray-600 mb-4">
              Artists are responsible for shipping arrangements unless otherwise
              specified. Delivery times may vary based on location. RenewCanvas
              Africa is not responsible for shipping delays caused by third-party
              carriers.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              10. Dispute Resolution
            </h2>
            <p className="text-gray-600 mb-4">
              In case of disputes between buyers and artists, RenewCanvas Africa
              will facilitate communication and may mediate to reach a fair
              resolution. Our decision in such matters shall be final.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              11. Limitation of Liability
            </h2>
            <p className="text-gray-600 mb-4">
              RenewCanvas Africa acts as an intermediary between artists and
              buyers. We are not liable for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Quality or authenticity of artwork</li>
              <li>Accuracy of environmental impact claims</li>
              <li>Shipping damages or losses</li>
              <li>Indirect or consequential damages</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              12. Account Termination
            </h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to suspend or terminate accounts that violate
              these terms, engage in fraudulent activity, or harm the platform
              community.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-gray-600 mb-4">
              We may update these terms periodically. Users will be notified of
              significant changes. Continued use of the platform after changes
              constitutes acceptance of the new terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              14. Governing Law
            </h2>
            <p className="text-gray-600 mb-4">
              These terms are governed by the laws of the Republic of Rwanda. Any
              disputes shall be subject to the exclusive jurisdiction of Rwandan
              courts.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              15. Contact Us
            </h2>
            <p className="text-gray-600 mb-4">
              For questions about these Terms and Conditions, please contact us:
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Email:</strong> hello.renewcanvas.africa@gmail.com
              </li>
              <li>
                <strong>Phone:</strong> +250 788 000 000
              </li>
              <li>
                <strong>Address:</strong> Kigali Innovation City, Kigali, Rwanda
              </li>
            </ul>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/privacy"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/refund-policy"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Refund Policy
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
