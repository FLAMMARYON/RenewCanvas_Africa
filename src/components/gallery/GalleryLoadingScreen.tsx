"use client";

import Image from "next/image";

// Design system colors (from globals.css)
const COLORS = {
  galleryBg: "#101417",
  primaryDark: "#0f766e",
};

type GalleryLoadingScreenProps = {
  message?: string;
};

/**
 * Loading screen for gallery with logo and spinner
 */
export function GalleryLoadingScreen({ message = "Loading gallery..." }: GalleryLoadingScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: COLORS.galleryBg }}
    >
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Image
            src="/brand/renewcanvas-icon-full-color-removebg-preview.png"
            alt="RenewCanvas Africa"
            width={120}
            height={120}
            className="h-30 w-30 animate-pulse"
            priority
          />
        </div>

        {/* Spinner */}
        <div
          className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-white/10"
          style={{ borderTopColor: COLORS.primaryDark }}
        ></div>

        {/* Loading message */}
        <p className="text-lg font-medium text-white">{message}</p>
        <p className="mt-2 text-sm text-white/65">Preparing your immersive experience...</p>
      </div>
    </div>
  );
}
