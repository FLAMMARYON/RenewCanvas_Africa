"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
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
            {t("terms.backToHome")}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-gray-100 p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("terms.pageTitle")}
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{t("terms.lastUpdated", { date: "May 1, 2026" })}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section1Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section1Body1")}
            </p>
            <p className="text-gray-600 mb-4">
              {t("terms.section1Body2")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section2Title")}
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>{t("terms.section2Term1")}</strong> {t("terms.section2Def1")}
              </li>
              <li>
                <strong>{t("terms.section2Term2")}</strong> {t("terms.section2Def2")}
              </li>
              <li>
                <strong>{t("terms.section2Term3")}</strong> {t("terms.section2Def3")}
              </li>
              <li>
                <strong>{t("terms.section2Term4")}</strong> {t("terms.section2Def4")}
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section3Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section3Body")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("terms.section3Item1")}</li>
              <li>{t("terms.section3Item2")}</li>
              <li>{t("terms.section3Item3")}</li>
              <li>{t("terms.section3Item4")}</li>
              <li>{t("terms.section3Item5")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section4Title")}
            </h2>
            <p className="text-gray-600 mb-4">{t("terms.section4Body")}</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("terms.section4Item1")}</li>
              <li>{t("terms.section4Item2")}</li>
              <li>{t("terms.section4Item3")}</li>
              <li>{t("terms.section4Item4")}</li>
              <li>{t("terms.section4Item5")}</li>
              <li>{t("terms.section4Item6")}</li>
              <li>{t("terms.section4Item7")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section5Title")}
            </h2>
            <p className="text-gray-600 mb-4">{t("terms.section5Body")}</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("terms.section5Item1")}</li>
              <li>{t("terms.section5Item2")}</li>
              <li>{t("terms.section5Item3")}</li>
              <li>{t("terms.section5Item4")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section6Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section6Body")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("terms.section6Item1")}</li>
              <li>{t("terms.section6Item2")}</li>
              <li>{t("terms.section6Item3")}</li>
            </ul>
            <p className="text-gray-600 mb-4">
              <strong>{t("terms.section6CommissionLabel")}</strong> {t("terms.section6CommissionBody")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section7Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section7Body")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section8Title")}
            </h2>
            <p className="text-gray-600 mb-4">{t("terms.section8Body")}</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("terms.section8Item1")}</li>
              <li>{t("terms.section8Item2")}</li>
              <li>{t("terms.section8Item3")}</li>
              <li>{t("terms.section8Item4")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section9Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section9Body")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section10Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section10Body")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section11Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section11Body")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("terms.section11Item1")}</li>
              <li>{t("terms.section11Item2")}</li>
              <li>{t("terms.section11Item3")}</li>
              <li>{t("terms.section11Item4")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section12Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section12Body")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section13Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section13Body")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section14Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section14Body")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("terms.section15Title")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("terms.section15Body")}
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-4">
              <li>
                <strong>{t("terms.section15EmailLabel")}</strong> hello.renewcanvas@gmail.com
              </li>
              <li>
                <strong>{t("terms.section15PhoneLabel")}</strong> +250 788 000 000
              </li>
              <li>
                <strong>{t("terms.section15AddressLabel")}</strong> {t("terms.section15AddressValue")}
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
                {t("terms.footerPrivacy")}
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/refund-policy"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {t("terms.footerRefund")}
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/contact"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {t("terms.footerContact")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
