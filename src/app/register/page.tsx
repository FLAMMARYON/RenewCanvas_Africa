"use client";

import {
  Recycle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Palette,
  ShoppingBag,
  User,
  Phone,
  Check,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation, Trans } from "react-i18next";
import { dashboardPathForRole, registerAccount } from "@/lib/frontend/auth-api";
import Navbar from "@/components/Navbar";

type UserRole = "buyer" | "artist";

function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [role, setRole] = useState<UserRole>("buyer");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ fullName?: boolean; email?: boolean; password?: boolean; confirmPassword?: boolean }>({});

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "artist") {
      setRole("artist");
    }
  }, [searchParams]);

  // Inline validation: required name, valid email, password >= 8, confirm match.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const fieldErrors = {
    fullName: !formData.fullName.trim() ? t("auth.validation.nameRequired", { defaultValue: "Full name is required" }) : "",
    email: !formData.email.trim()
      ? t("auth.validation.emailRequired", { defaultValue: "Email is required" })
      : !EMAIL_RE.test(formData.email.trim())
      ? t("auth.validation.emailInvalid", { defaultValue: "Enter a valid email address" })
      : "",
    password: formData.password.length < 8 ? t("auth.validation.passwordMin", { defaultValue: "Password must be at least 8 characters" }) : "",
    confirmPassword: formData.confirmPassword !== formData.password ? t("auth.validation.passwordMismatch", { defaultValue: "Passwords do not match" }) : "",
  };
  const isValid = !fieldErrors.fullName && !fieldErrors.email && !fieldErrors.password && !fieldErrors.confirmPassword && agreedToTerms;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const markTouched = (field: keyof typeof touched) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });

    if (!isValid) {
      if (!agreedToTerms) setError(t("auth.register.errTerms"));
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await registerAccount({
        email: formData.email,
        name: formData.fullName,
        password: formData.password,
        role,
      });
      router.push(dashboardPathForRole(session.role));
    } catch (error) {
      setError(error instanceof Error ? error.message : t("auth.register.errFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    {
      id: "buyer" as UserRole,
      title: t("auth.register.buyerTitle"),
      description: t("auth.register.buyerDesc"),
      icon: ShoppingBag,
    },
    {
      id: "artist" as UserRole,
      title: t("auth.register.artistTitle"),
      description: t("auth.register.artistDesc"),
      icon: Palette,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 relative overflow-hidden">
      <Navbar />

      {/* Background Dots Pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle, #14b8a6 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Floating Decorative Cards */}
      <div className="absolute top-20 right-[10%] w-48 h-32 bg-teal-200 rounded-xl rotate-12 opacity-60 hidden lg:block" />
      <div className="absolute top-40 right-[5%] w-40 h-28 bg-purple-200 rounded-xl -rotate-6 opacity-60 hidden lg:block">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Palette className="w-8 h-8 text-purple-400" />
        </div>
      </div>
      <div className="absolute bottom-32 right-[15%] w-56 h-36 bg-amber-200 rounded-xl rotate-6 opacity-60 hidden lg:block">
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <Recycle className="w-8 h-8 text-amber-500" />
        </div>
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-amber-600 font-medium text-sm">
          {t("auth.decoJoinMovement")}
        </p>
      </div>
      <div className="absolute bottom-20 left-[5%] w-32 h-32 bg-teal-300 rounded-full opacity-40 hidden lg:block" />
      <div className="absolute top-1/3 left-[8%] w-24 h-24 bg-amber-300 rounded-full opacity-30 hidden lg:block" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-lg">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 mb-8 justify-center">
            <img
              src="/brand/renewcanvas-icon-full-color.png"
              alt="RenewCanvas Africa logo"
              className="w-14 h-14"
            />
            <span className="text-2xl font-bold">
              <span style={{ color: "#0D5C4D" }}>RenewCanvas</span>{" "}
              <span style={{ color: "#F7941D" }}>Africa</span>
            </span>
          </a>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-white/50">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
                {t("auth.register.badge")}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <Trans i18nKey="auth.register.title" components={{ teal: <span className="text-teal-600" /> }} />
              </h1>
              <p className="text-gray-600">
                {t("auth.register.subtitle")}
              </p>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t("auth.register.iWantTo")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roleOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRole(option.id)}
                    className={`relative p-4 rounded-xl border-2 text-left [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)] ${
                      role === option.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-200 hover:border-teal-200 hover:bg-gray-50"
                    }`}
                  >
                    {role === option.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <option.icon
                      className={`w-6 h-6 mb-2 ${
                        role === option.id ? "text-teal-600" : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`font-medium text-sm ${
                        role === option.id ? "text-teal-700" : "text-gray-700"
                      }`}
                    >
                      {option.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("auth.fullName")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-teal-500" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={() => markTouched("fullName")}
                    placeholder={t("auth.fullNamePlaceholder")}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]"
                    required
                  />
                </div>
                {touched.fullName && fieldErrors.fullName && <p className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("auth.emailLabel")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-teal-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => markTouched("email")}
                    placeholder={t("auth.emailPlaceholder")}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]"
                    required
                  />
                </div>
                {touched.email && fieldErrors.email && <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>}
              </div>

              {/* Phone (Optional) */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("auth.phone")}{" "}
                  <span className="text-gray-400">{t("auth.optional")}</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-teal-500" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("auth.phonePlaceholder")}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("auth.passwordLabel")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-teal-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => markTouched("password")}
                    placeholder={t("auth.register.passwordPlaceholder")}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-teal-600 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-teal-600 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]" />
                    )}
                  </button>
                </div>
                {touched.password && fieldErrors.password && <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("auth.confirmPassword")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-teal-500" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => markTouched("confirmPassword")}
                    placeholder={t("auth.register.confirmPlaceholder")}
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-teal-600 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-teal-600 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]" />
                    )}
                  </button>
                </div>
                {touched.confirmPassword && fieldErrors.confirmPassword && <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  <Trans
                    i18nKey="auth.register.agree"
                    components={{
                      terms: <a href="/terms" className="text-teal-600 hover:text-teal-700 font-medium" />,
                      privacy: <a href="/privacy" className="text-teal-600 hover:text-teal-700 font-medium" />,
                    }}
                  />
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 text-white bg-teal-600 rounded-xl hover:bg-teal-700 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium hover:scale-[1.02] shadow-lg shadow-teal-600/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("auth.register.submitting")}
                  </>
                ) : (
                  <>
                    {t("auth.register.submit")}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  {t("auth.orContinue")}
                </span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)] font-medium text-gray-700"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t("auth.continueGoogle")}
            </button>

            {/* Sign In Link */}
            <p className="mt-6 text-center text-gray-600">
              {t("auth.register.haveAccount")}{" "}
              <a
                href="/login"
                className="text-teal-600 font-medium hover:text-teal-700"
              >
                {t("auth.register.signIn")}
              </a>
            </p>
          </div>

          {/* Bottom Tagline */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <Palette className="w-5 h-5 text-teal-500" />
              <span className="text-sm">
                {role === "artist" ? t("auth.register.taglineCreators") : t("auth.register.taglineCollectors")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>}>
      <RegisterForm />
    </Suspense>
  );
}
