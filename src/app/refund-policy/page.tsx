"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function RefundPolicyPage() {
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
            {t("refundPolicy.backToHome")}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl border border-gray-100 p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <RotateCcw className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("refundPolicy.title")}
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{t("refundPolicy.lastUpdated")}</span>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="bg-gradient-to-br from-teal-50 to-amber-50 rounded-xl p-6 mb-8 border border-teal-100">
            <h2 className="font-semibold text-gray-900 mb-4">{t("refundPolicy.quickSummaryHeading")}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{t("refundPolicy.summaryWindowTitle")}</p>
                  <p className="text-sm text-gray-600">
                    {t("refundPolicy.summaryWindowText")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{t("refundPolicy.summaryFullRefundTitle")}</p>
                  <p className="text-sm text-gray-600">
                    {t("refundPolicy.summaryFullRefundText")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{t("refundPolicy.summaryCaseByCaseTitle")}</p>
                  <p className="text-sm text-gray-600">
                    {t("refundPolicy.summaryCaseByCaseText")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.overviewHeading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("refundPolicy.overviewText")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.eligibilityHeading")}
            </h2>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              {t("refundPolicy.eligibleFullRefundHeading")}
            </h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>{t("refundPolicy.eligibleDamagedLabel")}</strong> {t("refundPolicy.eligibleDamagedText")}
              </li>
              <li>
                <strong>{t("refundPolicy.eligibleDifferentLabel")}</strong> {t("refundPolicy.eligibleDifferentText")}
              </li>
              <li>
                <strong>{t("refundPolicy.eligibleWrongItemLabel")}</strong> {t("refundPolicy.eligibleWrongItemText")}
              </li>
              <li>
                <strong>{t("refundPolicy.eligibleNotRepresentedLabel")}</strong> {t("refundPolicy.eligibleNotRepresentedText")}
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              {t("refundPolicy.caseByCaseHeading")}
            </h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>{t("refundPolicy.caseChangeOfMindLabel")}</strong> {t("refundPolicy.caseChangeOfMindText")}
              </li>
              <li>
                <strong>{t("refundPolicy.caseMinorVariationsLabel")}</strong> {t("refundPolicy.caseMinorVariationsText")}
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              {t("refundPolicy.notEligibleHeading")}
            </h3>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("refundPolicy.notEligibleBuyerHandling")}</li>
              <li>
                {t("refundPolicy.notEligibleCustom")}
              </li>
              <li>{t("refundPolicy.notEligibleLateRequest")}</li>
              <li>{t("refundPolicy.notEligibleAlteredTags")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.returnProcessHeading")}
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{t("refundPolicy.step1Title")}</p>
                    <p className="text-sm text-gray-600">
                      {t("refundPolicy.step1Text")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{t("refundPolicy.step2Title")}</p>
                    <p className="text-sm text-gray-600">
                      {t("refundPolicy.step2Text")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{t("refundPolicy.step3Title")}</p>
                    <p className="text-sm text-gray-600">
                      {t("refundPolicy.step3Text")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{t("refundPolicy.step4Title")}</p>
                    <p className="text-sm text-gray-600">
                      {t("refundPolicy.step4Text")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    5
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{t("refundPolicy.step5Title")}</p>
                    <p className="text-sm text-gray-600">
                      {t("refundPolicy.step5Text")}
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.refundMethodsHeading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("refundPolicy.refundMethodsIntro")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>{t("refundPolicy.refundMobileMoneyLabel")}</strong> {t("refundPolicy.refundMobileMoneyText")}
              </li>
              <li>
                <strong>{t("refundPolicy.refundBankTransferLabel")}</strong> {t("refundPolicy.refundBankTransferText")}
              </li>
              <li>
                <strong>{t("refundPolicy.refundCardLabel")}</strong> {t("refundPolicy.refundCardText")}
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.payoutHoldHeading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("refundPolicy.payoutHoldText")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.returnShippingHeading")}
            </h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>{t("refundPolicy.shippingDamagedLabel")}</strong> {t("refundPolicy.shippingDamagedText")}
              </li>
              <li>
                <strong>{t("refundPolicy.shippingChangeOfMindLabel")}</strong> {t("refundPolicy.shippingChangeOfMindText")}
              </li>
              <li>
                {t("refundPolicy.shippingOriginalPackaging")}
              </li>
              <li>{t("refundPolicy.shippingTracked")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.restockingFeeHeading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("refundPolicy.restockingFeeIntro")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("refundPolicy.restockingChangeOfMind")}</li>
              <li>{t("refundPolicy.restockingNoPackaging")}</li>
              <li>{t("refundPolicy.restockingMinorDamage")}</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.cancellationsHeading")}
            </h2>
            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              {t("refundPolicy.cancelBeforePaymentHeading")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("refundPolicy.cancelBeforePaymentText")}
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              {t("refundPolicy.cancelAfterPaymentHeading")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("refundPolicy.cancelAfterPaymentText")}
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
              {t("refundPolicy.cancelAfterShippingHeading")}
            </h3>
            <p className="text-gray-600 mb-4">
              {t("refundPolicy.cancelAfterShippingText")}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.disputesHeading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("refundPolicy.disputesIntro")}
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                {t("refundPolicy.disputesEscalate")}
              </li>
              <li>
                {t("refundPolicy.disputesDocumentation")}
              </li>
              <li>
                {t("refundPolicy.disputesReview")}
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.exchangesHeading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("refundPolicy.exchangesIntro")}
            </p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-2 mb-4">
              <li>{t("refundPolicy.exchangesStep1")}</li>
              <li>{t("refundPolicy.exchangesStep2")}</li>
            </ol>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">
              {t("refundPolicy.contactHeading")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("refundPolicy.contactIntro")}
            </p>
            <ul className="list-none text-gray-600 space-y-2 mb-4">
              <li>
                <strong>{t("refundPolicy.contactEmailLabel")}</strong> hello.renewcanvas@gmail.com
              </li>
              <li>
                <strong>{t("refundPolicy.contactPhoneLabel")}</strong> +250 788 000 000
              </li>
              <li>
                <strong>{t("refundPolicy.contactWhatsappLabel")}</strong> +250 788 000 000
              </li>
              <li>
                <strong>{t("refundPolicy.contactHoursLabel")}</strong> {t("refundPolicy.contactHoursText")}
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
                {t("refundPolicy.footerTerms")}
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/privacy"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {t("refundPolicy.footerPrivacy")}
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/contact"
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {t("refundPolicy.footerContact")}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
