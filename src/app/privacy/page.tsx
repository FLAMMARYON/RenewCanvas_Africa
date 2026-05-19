"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Calendar } from "lucide-react";

export default function PrivacyPage() {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Privacy Policy
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
              RenewCanvas Africa (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our platform
              and services.
            </p>
            <p className="text-gray-600 mb-4">
              By using RenewCanvas Africa, you consent to the data practices
              described in this policy.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              2. Information We Collect
            </h2>
            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              2.1 Personal Information
            </h3>
            <p className="text-gray-600 mb-4">
              We collect information you provide directly, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Name and contact information (email, phone number, address)</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (processed securely through payment providers)</li>
              <li>Profile information (bio, profile photo, social media links)</li>
              <li>Identification documents (for artist verification)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              2.2 Artwork Information
            </h3>
            <p className="text-gray-600 mb-4">For artists, we collect:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Artwork descriptions, images, and pricing</li>
              <li>Materials used and environmental impact data</li>
              <li>Sales history and earnings</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              2.3 Automatically Collected Information
            </h3>
            <p className="text-gray-600 mb-4">
              We automatically collect certain information when you visit our
              platform:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Device information (type, operating system, browser)</li>
              <li>IP address and location data</li>
              <li>Usage patterns and browsing behavior</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 mb-4">
              We use the collected information for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Providing and maintaining our services</li>
              <li>Processing transactions and payments</li>
              <li>Verifying artist identities and artwork authenticity</li>
              <li>Calculating and displaying environmental impact metrics</li>
              <li>Communicating with you about orders, updates, and promotions</li>
              <li>Improving our platform and user experience</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Complying with legal obligations</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              4. Information Sharing
            </h2>
            <p className="text-gray-600 mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Other Users:</strong> Artists and buyers can see each
                other's relevant information to facilitate transactions
              </li>
              <li>
                <strong>Service Providers:</strong> Third parties who help us
                operate our platform (payment processors, hosting services)
              </li>
              <li>
                <strong>Legal Authorities:</strong> When required by law or to
                protect our rights
              </li>
              <li>
                <strong>Business Transfers:</strong> In case of merger,
                acquisition, or sale of assets
              </li>
            </ul>
            <p className="text-gray-600 mb-4">
              We do not sell your personal information to third parties.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              5. Data Security
            </h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational security
              measures to protect your information, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and employee training</li>
            </ul>
            <p className="text-gray-600 mb-4">
              However, no method of transmission over the internet is 100%
              secure. We cannot guarantee absolute security.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              6. Cookies and Tracking
            </h2>
            <p className="text-gray-600 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Remember your preferences and login status</li>
              <li>Analyze platform usage and performance</li>
              <li>Personalize content and recommendations</li>
              <li>Provide social media features</li>
            </ul>
            <p className="text-gray-600 mb-4">
              You can control cookies through your browser settings, but some
              features may not function properly without them.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              7. Your Rights
            </h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Object to certain processing activities</li>
              <li>Data portability (receive your data in a usable format)</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-600 mb-4">
              To exercise these rights, contact us at hello.renewcanvas.africa@gmail.com.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              8. Data Retention
            </h2>
            <p className="text-gray-600 mb-4">
              We retain your information for as long as necessary to provide our
              services and fulfill the purposes described in this policy. After
              account deletion:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Personal data is deleted within 30 days</li>
              <li>
                Transaction records may be retained for legal and accounting
                purposes (up to 7 years)
              </li>
              <li>Anonymized data may be retained for analytics</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              9. Children&apos;s Privacy
            </h2>
            <p className="text-gray-600 mb-4">
              Our platform is not intended for children under 18 years of age. We
              do not knowingly collect personal information from children. If you
              believe we have collected data from a minor, please contact us
              immediately.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-600 mb-4">
              Your information may be transferred to and processed in countries
              other than Rwanda. We ensure appropriate safeguards are in place to
              protect your data in accordance with applicable laws.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              11. Third-Party Links
            </h2>
            <p className="text-gray-600 mb-4">
              Our platform may contain links to third-party websites. We are not
              responsible for their privacy practices. We encourage you to review
              their privacy policies before providing any information.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              12. Changes to This Policy
            </h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy periodically. We will notify you
              of significant changes via email or platform notification. Your
              continued use of the platform after changes constitutes acceptance
              of the updated policy.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              13. Contact Us
            </h2>
            <p className="text-gray-600 mb-4">
              For questions or concerns about this Privacy Policy or our data
              practices, please contact:
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Data Protection Officer:</strong> hello.renewcanvas.africa@gmail.com
              </li>
              <li>
                <strong>General Inquiries:</strong> hello.renewcanvas.africa@gmail.com
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
                href="/terms"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Terms and Conditions
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
