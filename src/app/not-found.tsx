"use client";

import Link from "next/link";
import { Recycle, Home, Search, ArrowLeft, Palette, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-12">
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

        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[150px] sm:text-[200px] font-bold text-teal-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-teal-100 to-amber-100 rounded-full flex items-center justify-center">
              <Search className="w-16 h-16 text-teal-400" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Page not found
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Or check out these popular pages:
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/marketplace"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-teal-200 transition-colors">
                <ShoppingBag className="w-6 h-6 text-teal-600" />
              </div>
              <span className="font-medium text-gray-900">Marketplace</span>
              <span className="text-sm text-gray-500">Browse artworks</span>
            </Link>
            <Link
              href="/artists"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                <Palette className="w-6 h-6 text-amber-600" />
              </div>
              <span className="font-medium text-gray-900">Artists</span>
              <span className="text-sm text-gray-500">Discover creators</span>
            </Link>
            <Link
              href="/impact"
              className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                <Recycle className="w-6 h-6 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">Impact</span>
              <span className="text-sm text-gray-500">Our mission</span>
            </Link>
          </div>
        </div>

        {/* Help Link */}
        <p className="mt-8 text-gray-500">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
