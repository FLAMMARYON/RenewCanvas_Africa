"use client";

import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface UserSession {
  id: string;
  name: string | null;
  email: string;
  role: "buyer" | "artist" | "admin";
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch session on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setSession(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setSessionLoading(false));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Fade out when scrolling away from top (past 50px)
      if (currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Artists", href: "/artists" },
    { name: "Impact", href: "/impact" },
    { name: "Contact", href: "/contact" },
  ];

  // Get user initials for avatar
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Get dashboard URL based on role
  const getDashboardUrl = () => {
    if (!session) return "/dashboard/buyer";
    switch (session.role) {
      case "admin":
        return "/dashboard/admin";
      case "artist":
        return "/dashboard/artist";
      default:
        return "/dashboard/buyer";
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img
              src="/brand/renewcanvas-icon-full-color.png"
              alt="RenewCanvas Africa logo"
              className="w-10 h-10"
            />
            <span className="text-xl font-bold">
              <span className="text-black">Renew</span><span style={{ color: "#0D5C4D" }}>Canvas</span>{" "}
              <span style={{ color: "#F7941D" }}>Africa</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-teal-700 transition-colors font-medium text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {sessionLoading ? (
              // Loading skeleton
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              // Logged in - Show avatar with dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(session.name, session.email)}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-900 truncate">
                        {session.name || "User"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{session.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-teal-100 text-teal-700 rounded capitalize">
                        {session.role}
                      </span>
                    </div>
                    <a
                      href={getDashboardUrl()}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </a>
                    <a
                      href={`${getDashboardUrl()}/profile`}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </a>
                    <a
                      href={`${getDashboardUrl()}/settings`}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </a>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Not logged in - Show Sign In / Get Started
              <div className="group flex items-center gap-3">
                <a
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-100 rounded-lg group-hover:bg-teal-800 group-hover:text-white [transition:all_0.4s_ease] group-hover:scale-105"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-700 rounded-lg group-hover:bg-white group-hover:text-teal-700 border border-transparent group-hover:border-teal-700 [transition:all_0.4s_ease] group-hover:scale-105"
                >
                  Get Started
                </a>
              </div>
            )}
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
                className="block py-2 text-gray-600 hover:text-teal-700 font-medium"
              >
                {link.name}
              </a>
            ))}

            {/* Mobile Auth Section */}
            {session ? (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(session.name, session.email)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{session.name || "User"}</p>
                    <p className="text-sm text-gray-500">{session.email}</p>
                  </div>
                </div>
                <a
                  href={getDashboardUrl()}
                  className="flex items-center gap-3 py-2 text-gray-700"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </a>
                <a
                  href={`${getDashboardUrl()}/profile`}
                  className="flex items-center gap-3 py-2 text-gray-700"
                >
                  <User className="w-4 h-4" />
                  Profile
                </a>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full py-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="group pt-4 flex flex-col gap-2">
                <a
                  href="/login"
                  className="w-full py-2 text-center text-teal-700 bg-teal-100 rounded-lg group-hover:bg-teal-800 group-hover:text-white [transition:all_0.4s_ease] group-hover:scale-105"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="w-full py-2 text-center text-white bg-teal-700 rounded-lg group-hover:bg-white group-hover:text-teal-700 border border-transparent group-hover:border-teal-700 [transition:all_0.4s_ease] group-hover:scale-105"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
