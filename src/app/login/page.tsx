"use client";

import {
  Recycle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Palette,
  Heart,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardPathForRole, loginWithPassword } from "@/lib/frontend/auth-api";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await loginWithPassword({ email, password });
      const nextPath = new URLSearchParams(window.location.search).get("next");
      router.push(nextPath?.startsWith("/") ? nextPath : dashboardPathForRole(session.role));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="absolute top-20 right-[10%] w-48 h-32 bg-teal-200 rounded-3xl rotate-12 opacity-60 hidden lg:block" />
      <div className="absolute top-40 right-[5%] w-40 h-28 bg-purple-200 rounded-3xl -rotate-6 opacity-60 hidden lg:block">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Heart className="w-8 h-8 text-purple-400" />
        </div>
      </div>
      <div className="absolute bottom-32 right-[15%] w-56 h-36 bg-amber-200 rounded-3xl rotate-6 opacity-60 hidden lg:block">
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <Recycle className="w-8 h-8 text-amber-500" />
        </div>
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-amber-600 font-medium text-sm">
          Upcycled Creation
        </p>
      </div>
      <div className="absolute bottom-20 left-[5%] w-32 h-32 bg-teal-300 rounded-full opacity-40 hidden lg:block" />
      <div className="absolute top-1/3 left-[8%] w-24 h-24 bg-amber-300 rounded-full opacity-30 hidden lg:block" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto w-full max-w-md">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/50">
            {/* Header */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Welcome Back
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sign In to Your <span className="text-teal-700">Account</span>
              </h1>
              <p className="text-gray-600">
                Continue your journey of sustainable art
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-teal-500" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none [transition:all_0.3s_ease]"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-teal-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white outline-none [transition:all_0.3s_ease]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-teal-600 [transition:all_0.3s_ease]" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-teal-600 [transition:all_0.3s_ease]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 text-white bg-teal-700 rounded-xl hover:bg-teal-800 [transition:all_0.4s_ease] font-medium hover:scale-[1.02] shadow-lg shadow-teal-700/30"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 [transition:all_0.3s_ease] font-medium text-gray-700"
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
              Continue with Google
            </button>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-gray-600">
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="text-teal-600 font-medium hover:text-teal-700"
              >
                Sign up for free
              </a>
            </p>
          </div>

          {/* Bottom Tagline */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <Palette className="w-5 h-5 text-teal-500" />
              <span className="text-sm">Transforming waste into art</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
