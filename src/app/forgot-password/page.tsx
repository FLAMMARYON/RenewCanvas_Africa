"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Recycle, Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { requestResetLink } from "@/lib/frontend/auth-api";
import Navbar from "@/components/Navbar";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const token = await requestResetLink(email);
      setResetToken(token);
      setIsSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : t("auth.forgot.errFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center px-4 py-24">
      <Navbar />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <img
              src="/brand/renewcanvas-icon-full-color.png"
              alt="RenewCanvas Africa logo"
              className="w-14 h-14"
            />
            <span className="text-2xl font-bold">
              <span style={{ color: "#0D5C4D" }}>RenewCanvas</span>{" "}
              <span style={{ color: "#F7941D" }}>Africa</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-teal-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("auth.forgot.title")}
                </h1>
                <p className="text-gray-600">
                  {t("auth.forgot.subtitle")}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {t("auth.emailLabel")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.emailPlaceholder")}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("auth.forgot.submitting")}
                    </>
                  ) : (
                    t("auth.forgot.submit")
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t("auth.forgot.sentTitle")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("auth.forgot.sentTo")}{" "}
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  {t("auth.forgot.noEmail")}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail("");
                    }}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    {t("auth.forgot.tryAnother")}
                  </button>
                </p>
                {resetToken && (
                  <p className="mt-3 text-xs text-gray-500 break-all">
                    {t("auth.forgot.devLink")} /reset-password?token={resetToken}
                  </p>
                )}
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("auth.backToSignIn")}
              </Link>
            </div>
          )}
        </div>

        {/* Back to Login */}
        {!isSubmitted && (
          <div className="text-center mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("auth.backToSignIn")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
