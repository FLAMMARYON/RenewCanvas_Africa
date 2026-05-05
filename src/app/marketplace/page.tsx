"use client";

import {
  Recycle,
  Palette,
  ArrowRight,
  Leaf,
  Menu,
  X,
  Search,
  Filter,
  Grid3X3,
  LayoutList,
  SlidersHorizontal,
  Package,
  ChevronDown,
  Box,
  Gavel,
  Flame,
  Clock,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

// Mock data to check if auctions exist
const hasActiveAuctions = true; // Set to false to hide auctions link
const activeAuctionCount = 3;

export default function MarketplacePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Experience Links */}
      <ExperienceLinks />

      {/* Filters & Artwork Grid */}
      <MarketplaceSection viewMode={viewMode} setViewMode={setViewMode} />

      {/* CTA Section */}
      <CTASection />

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
              Renew<span className="text-teal-700">Canvas</span> <span className="text-amber-600">Africa</span>
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
                    ? "text-teal-700"
                    : "text-gray-600 hover:text-teal-700"
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
              className="px-4 py-2 text-sm font-medium text-teal-800 bg-teal-100 rounded-lg group-hover:bg-teal-800 group-hover:text-white [transition:all_0.4s_ease] group-hover:scale-105"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-700 rounded-lg group-hover:bg-white group-hover:text-teal-800 border border-transparent group-hover:border-teal-700 [transition:all_0.4s_ease] group-hover:scale-105"
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
                    ? "text-teal-700"
                    : "text-gray-600 hover:text-teal-700"
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="group pt-4 flex flex-col gap-2">
              <a
                href="/login"
                className="w-full py-2 text-center text-teal-800 bg-teal-100 rounded-lg group-hover:bg-teal-800 group-hover:text-white [transition:all_0.4s_ease] group-hover:scale-105"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="w-full py-2 text-center text-white bg-teal-700 rounded-lg group-hover:bg-white group-hover:text-teal-800 border border-transparent group-hover:border-teal-700 [transition:all_0.4s_ease] group-hover:scale-105"
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
   HERO SECTION
   ============================================ */
function HeroSection() {
  return (
    <section className="relative pt-24 pb-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Discover <span className="text-teal-700">Unique</span> Upcycled{" "}
            <span className="text-amber-600">Artwork</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Browse our collection of stunning artwork created from recycled
            materials and discover unique pieces by independent and professional
            artists. Each piece comes with verified environmental impact.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search artwork, artists, or categories..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 [transition:all_0.4s_ease] text-sm font-medium">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   EXPERIENCE LINKS
   ============================================ */
function ExperienceLinks() {
  return (
    <section className="py-6 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Virtual Room Link */}
          <Link
            href="/virtual-room"
            className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl hover:border-purple-300 hover:shadow-md [transition:all_0.3s_ease]"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 [transition:transform_0.3s_ease]">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Virtual Gallery</p>
              <p className="text-xs text-gray-500">Walk through our 3D museum</p>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 [transition:transform_0.3s_ease]" />
          </Link>

          {/* Auctions Link - Only show if there are active auctions */}
          {hasActiveAuctions && (
            <Link
              href="/auctions"
              className="group flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl hover:border-amber-300 hover:shadow-md [transition:all_0.3s_ease]"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 [transition:transform_0.3s_ease]">
                  <Gavel className="w-5 h-5 text-white" />
                </div>
                {/* Live indicator */}
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 rounded-full">
                  <Flame className="w-3 h-3 text-white animate-pulse" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 text-sm">Live Auctions</p>
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                    {activeAuctionCount} LIVE
                  </span>
                </div>
                <p className="text-xs text-gray-500">Bid on exclusive pieces</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 [transition:transform_0.3s_ease]" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   MARKETPLACE SECTION
   ============================================ */
function MarketplaceSection({
  viewMode,
  setViewMode,
}: {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
}) {
  const categories = [
    "All",
    "Paintings",
    "Sculptures",
    "Jewelry",
    "Home Decor",
    "Fashion",
    "Mixed Media",
  ];

  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium [transition:all_0.3s_ease] ${
                  activeCategory === category
                    ? "bg-teal-700 text-white"
                    : "bg-white text-gray-600 hover:bg-teal-50 hover:text-teal-700 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* View & Filter Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-teal-300 [transition:all_0.3s_ease]">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Sort by</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-teal-300 [transition:all_0.3s_ease]">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Show artwork grid"
                aria-pressed={viewMode === "grid"}
                className={`p-2 [transition:all_0.3s_ease] ${
                  viewMode === "grid"
                    ? "bg-teal-700 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="Show artwork list"
                aria-pressed={viewMode === "list"}
                className={`p-2 [transition:all_0.3s_ease] ${
                  viewMode === "list"
                    ? "bg-teal-700 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon State */}
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-teal-700" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Artwork Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              We are currently onboarding talented artists and curating our first
              collection of unique upcycled artwork. Be the first to know when
              we launch!
            </p>
            <div className="group flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-teal-700 rounded-lg group-hover:bg-white group-hover:text-teal-800 border border-transparent group-hover:border-teal-700 [transition:all_0.4s_ease] font-medium group-hover:scale-105"
              >
                Get Notified
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/artists"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-teal-800 bg-teal-100 rounded-lg group-hover:bg-teal-800 group-hover:text-white [transition:all_0.4s_ease] font-medium group-hover:scale-105"
              >
                Join as Artist
              </a>
            </div>
          </div>
        </div>

        {/* Placeholder Grid - Hidden for now, will be shown when artworks are available */}
        {/* <ArtworkGrid viewMode={viewMode} /> */}
      </div>
    </section>
  );
}

/* ============================================
   CTA SECTION
   ============================================ */
function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* For Buyers */}
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-8">
            <div className="w-14 h-14 bg-teal-700 rounded-xl flex items-center justify-center mb-6">
              <Palette className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Looking for Unique Art?
            </h3>
            <p className="text-gray-600 mb-6">
              Sign up to be notified when our marketplace launches. Get early
              access to exclusive upcycled artwork with verified impact stories.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 text-white bg-teal-700 rounded-lg hover:bg-white hover:text-teal-800 border border-transparent hover:border-teal-700 [transition:all_0.4s_ease] font-medium hover:scale-105"
            >
              Join Waitlist
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* For Artists */}
          <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8">
            <span className="absolute top-4 right-4 px-3 py-1 bg-amber-700 text-white text-xs font-semibold rounded-full">
              Coming Soon
            </span>
            <div className="w-14 h-14 bg-amber-600 rounded-xl flex items-center justify-center mb-6">
              <Recycle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Are You an Artist?
            </h3>
            <p className="text-gray-600 mb-6">
              Join our platform and showcase your upcycled creations to buyers
              who value sustainability. We provide materials and support.
            </p>
            <a
              href="/register?role=artist"
              className="inline-flex items-center gap-2 px-6 py-3 text-white bg-amber-700 rounded-lg hover:bg-white hover:text-amber-800 border border-transparent hover:border-amber-700 [transition:all_0.4s_ease] font-medium hover:scale-105"
            >
              Apply as Artist
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
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
            <p className="text-sm text-gray-400">Kigali, Rwanda</p>
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
          <p className="text-sm text-gray-400">
            &copy; {currentYear} RenewCanvas <span className="text-amber-400">Africa</span>. All rights reserved.
          </p>
          <span className="hidden sm:inline text-gray-600">|</span>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Leaf className="w-4 h-4 text-teal-500" />
            <span>Built for a sustainable future</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
