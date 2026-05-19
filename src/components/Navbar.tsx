"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/artists", label: "Artists" },
  { href: "/impact", label: "Impact" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Fade out when scrolling away from top (past 50px)
      if (currentScrollY > 50) {
        setIsVisible(false);
        setIsMenuOpen(false); // Close menu when hiding
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-opacity duration-300 ${
          isVisible
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <img
                  src="/brand/renewcanvas-icon-full-color.png"
                  alt="RenewCanvas Africa logo"
                  className="w-10 h-10"
                />
                <span className="font-bold text-xl">
                  <span style={{ color: "#0D5C4D" }}>RenewCanvas</span>{" "}
                  <span style={{ color: "#F7941D" }}>Africa</span>
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-2 text-gray-600 hover:text-[#007A68] font-medium transition-colors rounded-lg hover:bg-teal-50"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Desktop Auth Buttons */}
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-[#007A68] font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-[#007A68] text-white rounded-lg font-medium hover:bg-[#005A4D] transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-[#007A68] hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <img
                src="/brand/renewcanvas-icon-full-color.png"
                alt="RenewCanvas Africa logo"
                className="w-9 h-9"
              />
              <span className="font-bold">
                <span style={{ color: "#0D5C4D" }}>RenewCanvas</span>{" "}
                <span style={{ color: "#F7941D" }}>Africa</span>
              </span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Links */}
          <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 text-gray-700 hover:text-[#007A68] hover:bg-teal-50 rounded-lg transition-colors font-medium"
              >
                {link.label}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>

          {/* Menu Footer - Auth Buttons */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gray-50 space-y-3">
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full py-3 text-center text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full py-3 text-center text-white font-medium bg-[#007A68] rounded-lg hover:bg-[#005A4D] transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer to account for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
