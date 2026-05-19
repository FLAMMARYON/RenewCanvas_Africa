"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Recycle, RefreshCw, Home, AlertTriangle, Bug } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-amber-50 flex items-center justify-center px-4">
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

        {/* Error Illustration */}
        <div className="relative mb-8">
          <div className="w-40 h-40 bg-gradient-to-br from-red-100 to-amber-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-20 h-20 text-red-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-amber-400 rounded-full opacity-50 blur-lg" />
        </div>

        {/* Message */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          We apologize for the inconvenience. An unexpected error has occurred.
          Please try again or contact support if the problem persists.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>
        </div>

        {/* Error Details (Development) */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="bg-gray-900 rounded-xl p-6 text-left overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Bug className="w-5 h-5 text-red-400" />
              <span className="font-mono text-red-400 font-medium">
                Error Details
              </span>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                {error.message}
              </pre>
              {error.digest && (
                <p className="mt-4 text-sm text-gray-500">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Support Info */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-2">Need help?</h2>
          <p className="text-gray-600 mb-4">
            If this error continues, please contact our support team with the
            following information:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Time:</span>{" "}
              {new Date().toISOString()}
            </p>
            {error?.digest && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Reference:</span> {error.digest}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Page:</span>{" "}
              {typeof window !== "undefined" ? window.location.href : "Unknown"}
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 mt-4 text-teal-600 hover:text-teal-700 font-medium"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
