"use client";

import {
  Recycle,
  Palette,
  ArrowRight,
  Leaf,
  Menu,
  X,
  Heart,
  Share2,
  ShoppingCart,
  MapPin,
  Package,
  Award,
  ChevronLeft,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

export default function ArtworkDetailPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Artwork Detail */}
      <ArtworkDetail />

      {/* Impact Section */}
      <ImpactSection />

      {/* Artist Section */}
      <ArtistSection />

      {/* Related Artworks */}
      <RelatedArtworks />

      {/* Footer */}
      <Footer />
    </div>
  );
}

/* ============================================
   NAVIGATION COMPONENT
   ============================================ */
function Navigation({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Artists", href: "/artists" },
    { name: "Impact", href: "/impact" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Renew<span className="text-teal-600">Canvas</span> <span className="text-amber-500">Africa</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.href === "/marketplace"
                    ? "text-teal-600"
                    : "text-gray-600 hover:text-teal-600"
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="group hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-100 rounded-lg group-hover:bg-teal-600 group-hover:text-white [transition:all_0.4s_ease] group-hover:scale-105"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg group-hover:bg-white group-hover:text-teal-600 border border-transparent group-hover:border-teal-600 [transition:all_0.4s_ease] group-hover:scale-105"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-600 z-50 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4">
          <div className="max-w-7xl mx-auto px-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`block py-2 font-medium ${
                  link.href === "/marketplace"
                    ? "text-teal-600"
                    : "text-gray-600 hover:text-teal-600"
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="group pt-4 flex flex-col gap-2">
              <a
                href="/login"
                className="w-full py-2 text-center text-teal-700 bg-teal-100 rounded-lg group-hover:bg-teal-600 group-hover:text-white [transition:all_0.4s_ease] group-hover:scale-105"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="w-full py-2 text-center text-white bg-teal-600 rounded-lg group-hover:bg-white group-hover:text-teal-600 border border-transparent group-hover:border-teal-600 [transition:all_0.4s_ease] group-hover:scale-105"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ============================================
   BREADCRUMB
   ============================================ */
function Breadcrumb() {
  return (
    <div className="pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm">
          <a href="/" className="text-gray-500 hover:text-teal-600">
            Home
          </a>
          <span className="text-gray-300">/</span>
          <a href="/marketplace" className="text-gray-500 hover:text-teal-600">
            Marketplace
          </a>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">Artwork Title</span>
        </nav>
      </div>
    </div>
  );
}

/* ============================================
   ARTWORK DETAIL
   ============================================ */
function ArtworkDetail() {
  const [selectedImage, setSelectedImage] = useState(0);

  // Placeholder images
  const images = [
    "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80",
  ];

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="group relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm mb-4">
              <img
                src={images[selectedImage]}
                alt="Artwork"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Teal hue overlay */}
              <div className="absolute inset-0 bg-teal-600/0 transition-all duration-300 group-hover:bg-teal-600/20" />

              {/* Navigation Arrows */}
              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white [transition:all_0.3s_ease]"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={() =>
                  setSelectedImage((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white [transition:all_0.3s_ease]"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden [transition:all_0.3s_ease] ${
                    selectedImage === index
                      ? "ring-2 ring-teal-500"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Artwork Info */}
          <div>
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">
                Mixed Media
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                Upcycled
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Sample Artwork Title
            </h1>

            {/* Artist */}
            <p className="text-gray-600 mb-4">
              By{" "}
              <a href="#" className="text-teal-600 font-medium hover:underline">
                Artist Name
              </a>
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-gray-900">$XXX</span>
              <span className="text-gray-500">USD</span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">
                This is a sample artwork description. When real artworks are
                added, this will contain the artist&apos;s description of the piece,
                including inspiration, technique, and the story behind its
                creation from recycled materials.
              </p>
            </div>

            {/* Materials */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Materials Used
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  Recycled Plastic
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  Cardboard
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  Fabric Scraps
                </span>
              </div>
            </div>

            {/* Dimensions */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Dimensions</h3>
              <p className="text-gray-600">XX cm × XX cm × XX cm</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 text-white bg-teal-600 rounded-xl hover:bg-white hover:text-teal-600 border border-transparent hover:border-teal-600 [transition:all_0.4s_ease] font-medium hover:scale-105">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-4 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 [transition:all_0.3s_ease]">
                <Heart className="w-5 h-5" />
                Save
              </button>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-4 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 [transition:all_0.3s_ease]">
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <Truck className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Secure Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Verified Impact</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-teal-600 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   IMPACT SECTION
   ============================================ */
function ImpactSection() {
  const impacts = [
    {
      icon: Recycle,
      value: "X.X kg",
      label: "Waste Diverted",
      color: "teal",
    },
    {
      icon: Leaf,
      value: "X.X kg",
      label: "CO2 Saved",
      color: "green",
    },
    {
      icon: Package,
      value: "X",
      label: "Materials Used",
      color: "amber",
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    teal: { bg: "bg-teal-100", text: "text-teal-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600" },
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Environmental Impact
          </h2>
          <p className="text-gray-600">
            This artwork&apos;s verified contribution to sustainability
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {impacts.map((impact, index) => {
            const colors = colorClasses[impact.color];
            return (
              <div
                key={index}
                className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-md [transition:all_0.3s_ease]"
              >
                <div
                  className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}
                >
                  <impact.icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <p className={`text-2xl font-bold ${colors.text} mb-1`}>
                  {impact.value}
                </p>
                <p className="text-sm text-gray-600">{impact.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   ARTIST SECTION
   ============================================ */
function ArtistSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Artist Image */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                  alt="Artist"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Artist Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Artist Name
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Kigali, Rwanda</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                    <Award className="w-4 h-4" />
                    <span>Verified Artist</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">
                  Artist bio will appear here. This section showcases the
                  artist&apos;s background, their passion for sustainable art, and
                  their journey with RenewCanvas Africa.
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>
                    <strong className="text-gray-900">-</strong> artworks
                  </span>
                  <span>
                    <strong className="text-gray-900">-</strong> kg diverted
                  </span>
                </div>

                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-teal-600 font-medium hover:underline"
                >
                  View Artist Profile
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   RELATED ARTWORKS
   ============================================ */
function RelatedArtworks() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You May Also Like
          </h2>
          <p className="text-gray-600">
            Discover more unique upcycled artwork
          </p>
        </div>

        {/* Coming Soon State */}
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            More Artworks Coming Soon
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We are curating a collection of unique upcycled artwork. Check back
            soon to discover more pieces.
          </p>
          <a
            href="/marketplace"
            className="inline-flex items-center gap-2 text-teal-600 font-medium hover:underline"
          >
            Browse Marketplace
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FOOTER COMPONENT
   ============================================ */
function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "How It Works", href: "/how-it-works" },
      { name: "Marketplace", href: "/marketplace" },
      { name: "Artists", href: "/artists" },
      { name: "Impact", href: "/impact" },
    ],
    company: [
      { name: "About Us", href: "/#about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
    support: [
      { name: "FAQ", href: "/faq" },
      { name: "Help Center", href: "/help" },
      { name: "Shipping", href: "/shipping" },
      { name: "Returns", href: "/returns" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refund-policy" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Renew<span className="text-teal-400">Canvas</span> <span className="text-amber-500">Africa</span>
              </span>
            </a>
            <p className="text-sm text-gray-400 mb-4">
              Transforming waste into art, one masterpiece at a time.
            </p>
            <p className="text-sm text-gray-500">Kigali, Rwanda</p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} RenewCanvas <span className="text-amber-500">Africa</span>. All rights reserved.
          </p>
          <span className="hidden sm:inline text-gray-600">|</span>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Leaf className="w-4 h-4 text-teal-500" />
            <span>Built for a sustainable future</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
