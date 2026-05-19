"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Recycle,
  LayoutDashboard,
  Heart,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Palette,
  Plus,
  BarChart3,
  Users,
  CheckSquare,
  Package,
  FileText,
  Scale,
  Gavel,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import {
  dashboardPathForRole,
  logoutServerSession,
  readServerSession,
  type FrontendSession,
} from "@/lib/frontend/auth-api";
import AnimatedLogo from "@/components/AnimatedLogo";

type UserRole = "buyer" | "artist" | "admin";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
}

const navigationItems = {
  buyer: [
    { name: "Dashboard", href: "/dashboard/buyer", icon: LayoutDashboard },
    { name: "My Orders", href: "/dashboard/buyer/orders", icon: ShoppingBag },
    { name: "Commissions", href: "/dashboard/buyer/commissions", icon: FileText },
    { name: "Wishlist", href: "/dashboard/buyer/wishlist", icon: Heart },
    { name: "Profile", href: "/dashboard/buyer/profile", icon: User },
    { name: "Settings", href: "/dashboard/buyer/settings", icon: Settings },
  ],
  artist: [
    { name: "Dashboard", href: "/dashboard/artist", icon: LayoutDashboard },
    { name: "My Artworks", href: "/dashboard/artist/artworks", icon: Palette },
    {
      name: "Create Artwork",
      href: "/dashboard/artist/artworks/create",
      icon: Plus,
    },
    { name: "Orders", href: "/dashboard/artist/orders", icon: ShoppingBag },
    { name: "Commissions", href: "/dashboard/artist/commissions", icon: FileText },
    { name: "Analytics", href: "/dashboard/artist/analytics", icon: BarChart3 },
    { name: "Profile", href: "/dashboard/artist/profile", icon: User },
    { name: "Settings", href: "/dashboard/artist/settings", icon: Settings },
  ],
  admin: [
    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Messages", href: "/dashboard/admin/messages", icon: MessageSquare },
    { name: "Users", href: "/dashboard/admin/users", icon: Users },
    {
      name: "Artist Verification",
      href: "/dashboard/admin/artists",
      icon: CheckSquare,
    },
    {
      name: "Artwork Moderation",
      href: "/dashboard/admin/artworks",
      icon: Palette,
    },
    {
      name: "Auctions",
      href: "/dashboard/admin/auctions",
      icon: Gavel,
    },
    {
      name: "Material Records",
      href: "/dashboard/admin/materials",
      icon: Recycle,
    },
    {
      name: "Impact Dashboard",
      href: "/dashboard/admin/impact",
      icon: BarChart3,
    },
    { name: "Orders", href: "/dashboard/admin/orders", icon: Package },
    { name: "Commissions", href: "/dashboard/admin/commissions", icon: FileText },
    { name: "Profile", href: "/dashboard/admin/profile", icon: User },
    { name: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
};

const roleLabels = {
  buyer: "Buyer Account",
  artist: "Artist Account",
  admin: "Admin Panel",
};

export default function DashboardLayout({
  children,
  role,
  userName = "User",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [session, setSession] = useState<FrontendSession | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = navigationItems[role];
  const displayName = session?.name || userName;

  useEffect(() => {
    let isCurrent = true;

    async function checkAccess() {
      try {
        const activeSession = await readServerSession();

        if (!isCurrent) {
          return;
        }

        if (!activeSession) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }

        if (activeSession.role !== role) {
          router.replace(dashboardPathForRole(activeSession.role));
          return;
        }

        setSession(activeSession);
        setAuthChecked(true);
      } catch {
        if (isCurrent) {
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
      }
    }

    checkAccess();

    return () => {
      isCurrent = false;
    };
  }, [pathname, role, router]);

  const handleSignOut = async () => {
    await logoutServerSession();
    router.replace("/login");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AnimatedLogo size={80} animate />
        <p className="mt-4 text-sm text-gray-500">Checking account access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/brand/renewcanvas-icon-full-color.png"
              alt="RenewCanvas Africa logo"
              className="w-9 h-9"
            />
            <span className="text-lg font-bold">
              <span style={{ color: "#0D5C4D" }}>RenewCanvas</span>{" "}
              <span style={{ color: "#F7941D" }}>Africa</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Badge */}
        <div className="px-4 py-3 border-b border-gray-100">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
            {role === "buyer" && <ShoppingBag className="w-3 h-3" />}
            {role === "artist" && <Palette className="w-3 h-3" />}
            {role === "admin" && <Scale className="w-3 h-3" />}
            {roleLabels[role]}
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActive ? "text-[#007A68]" : "text-gray-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <FileText className="w-5 h-5 text-gray-400" />
            Back to Website
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Page Title - Hidden on mobile */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-gray-900">
              {navItems.find((item) => item.href === pathname)?.name ||
                "Dashboard"}
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                <User className="w-4 h-4 text-[#007A68]" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {displayName}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                <Link
                  href={`/dashboard/${role}/profile`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  My Profile
                </Link>
                <Link
                  href={`/dashboard/${role}/settings`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </Link>
                <hr className="my-1" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
