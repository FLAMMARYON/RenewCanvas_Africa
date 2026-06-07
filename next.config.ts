import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * Shipped as Report-Only first (per security hardening plan) so we can observe
 * violations in production without breaking the app. Once the report stream is
 * clean, switch the header key below from
 * "Content-Security-Policy-Report-Only" to "Content-Security-Policy".
 *
 * 'unsafe-inline'/'unsafe-eval' are currently required by Next.js runtime and
 * the Three.js / Google Translate widgets. Tighten with nonces when those are
 * isolated.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.google.com https://translate.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https: wss:",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  "frame-src 'self' https://translate.google.com",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  // Do not leak the framework/version to attackers.
  poweredByHeader: false,
  async redirects() {
    return [
      // The dedicated FAQ page was folded into the Contact page.
      { source: "/faq", destination: "/contact#faq", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
