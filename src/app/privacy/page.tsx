"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PrivacyPage() {
  const { t } = useTranslation();
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
            {t("privacy.backToHome")}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-gray-100 p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("privacy.pageTitle")}
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{t("privacy.lastUpdated", { date: "May 1, 2026" })}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section1Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section1Para1")}
            </p>
            <p className="text-gray-600 mb-4">
              {t("privacy.section1Para2")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section2Heading")}
            </h2>
            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              {t("privacy.section2_1Heading")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("privacy.section2_1Intro")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("privacy.section2_1Item1")}</li>
              <li>{t("privacy.section2_1Item2")}</li>
              <li>{t("privacy.section2_1Item3")}</li>
              <li>{t("privacy.section2_1Item4")}</li>
              <li>{t("privacy.section2_1Item5")}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              {t("privacy.section2_2Heading")}
            </h3>
            <p className="text-gray-600 mb-4">{t("privacy.section2_2Intro")}</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("privacy.section2_2Item1")}</li>
              <li>{t("privacy.section2_2Item2")}</li>
              <li>{t("privacy.section2_2Item3")}</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              {t("privacy.section2_3Heading")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("privacy.section2_3Intro")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("privacy.section2_3Item1")}</li>
              <li>{t("privacy.section2_3Item2")}</li>
              <li>{t("privacy.section2_3Item3")}</li>
              <li>{t("privacy.section2_3Item4")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section3Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section3Intro")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("privacy.section3Item1")}</li>
              <li>{t("privacy.section3Item2")}</li>
              <li>{t("privacy.section3Item3")}</li>
              <li>{t("privacy.section3Item4")}</li>
              <li>{t("privacy.section3Item5")}</li>
              <li>{t("privacy.section3Item6")}</li>
              <li>{t("privacy.section3Item7")}</li>
              <li>{t("privacy.section3Item8")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section4Heading")}
            </h2>
            <p className="text-gray-600 mb-4">{t("privacy.section4Intro")}</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>{t("privacy.section4Item1Label")}</strong>{" "}
                {t("privacy.section4Item1Text")}
              </li>
              <li>
                <strong>{t("privacy.section4Item2Label")}</strong>{" "}
                {t("privacy.section4Item2Text")}
              </li>
              <li>
                <strong>{t("privacy.section4Item3Label")}</strong>{" "}
                {t("privacy.section4Item3Text")}
              </li>
              <li>
                <strong>{t("privacy.section4Item4Label")}</strong>{" "}
                {t("privacy.section4Item4Text")}
              </li>
            </ul>
            <p className="text-gray-600 mb-4">
              {t("privacy.section4Outro")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section5Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section5Intro")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("privacy.section5Item1")}</li>
              <li>{t("privacy.section5Item2")}</li>
              <li>{t("privacy.section5Item3")}</li>
              <li>{t("privacy.section5Item4")}</li>
            </ul>
            <p className="text-gray-600 mb-4">
              {t("privacy.section5Outro")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section6Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section6Intro")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("privacy.section6Item1")}</li>
              <li>{t("privacy.section6Item2")}</li>
              <li>{t("privacy.section6Item3")}</li>
              <li>{t("privacy.section6Item4")}</li>
            </ul>
            <p className="text-gray-600 mb-4">
              {t("privacy.section6Outro")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section7Heading")}
            </h2>
            <p className="text-gray-600 mb-4">{t("privacy.section7Intro")}</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("privacy.section7Item1")}</li>
              <li>{t("privacy.section7Item2")}</li>
              <li>{t("privacy.section7Item3")}</li>
              <li>{t("privacy.section7Item4")}</li>
              <li>{t("privacy.section7Item5")}</li>
              <li>{t("privacy.section7Item6")}</li>
            </ul>
            <p className="text-gray-600 mb-4">
              {t("privacy.section7Outro", { email: "hello.renewcanvas@gmail.com" })}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section8Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section8Intro")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("privacy.section8Item1")}</li>
              <li>
                {t("privacy.section8Item2")}
              </li>
              <li>{t("privacy.section8Item3")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section9Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section9Para1")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section10Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section10Para1")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section11Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section11Para1")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section12Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section12Para1")}
            </p>
            <p className="text-gray-600 mb-4">
              {t("privacy.section12Para2", { email: "hello.renewcanvas@gmail.com" })}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section13Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section13Para1")}
            </p>
            <p className="text-gray-600 mb-4">
              {t("privacy.section13Para2", { email: "hello.renewcanvas@gmail.com" })}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section14Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section14Para1")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("privacy.section15Heading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("privacy.section15Intro")}
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-4">
              <li>
                <strong>{t("privacy.section15DpoLabel")}</strong> hello.renewcanvas@gmail.com
              </li>
              <li>
                <strong>{t("privacy.section15GeneralLabel")}</strong> hello.renewcanvas@gmail.com
              </li>
              <li>
                <strong>{t("privacy.section15PhoneLabel")}</strong> +250 788 000 000
              </li>
              <li>
                <strong>{t("privacy.section15AddressLabel")}</strong> {t("privacy.section15AddressValue")}
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
                {t("privacy.footerTerms")}
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/refund-policy"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {t("privacy.footerRefund")}
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/contact"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {t("privacy.footerContact")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
