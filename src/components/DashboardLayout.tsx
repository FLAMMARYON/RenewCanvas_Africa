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
  Bell,
} from "lucide-react";
import {
  dashboardPathForRole,
  logoutServerSession,
  readServerSession,
  type FrontendSession,
} from "@/lib/frontend/auth-api";
import AnimatedLogo from "@/components/AnimatedLogo";
import { useTranslation } from "react-i18next";

type UserRole = "buyer" | "artist" | "admin";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  userName?: string;
}

type NavigationItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  group?: string;
};

const navigationItems: Record<UserRole, NavigationItem[]> = {
  buyer: [
    { name: "dashboard.nav.dashboard", href: "/dashboard/buyer", icon: LayoutDashboard },
    { name: "dashboard.nav.myOrders", href: "/dashboard/buyer/orders", icon: ShoppingBag },
    { name: "dashboard.nav.commissions", href: "/dashboard/buyer/commissions", icon: FileText },
    { name: "dashboard.nav.wishlist", href: "/dashboard/buyer/wishlist", icon: Heart },
    { name: "dashboard.nav.profile", href: "/dashboard/buyer/profile", icon: User },
    { name: "dashboard.nav.settings", href: "/dashboard/buyer/settings", icon: Settings },
  ],
  artist: [
    { name: "dashboard.nav.dashboard", href: "/dashboard/artist", icon: LayoutDashboard },
    { name: "dashboard.nav.myArtworks", href: "/dashboard/artist/artworks", icon: Palette },
    {
      name: "dashboard.nav.createArtwork",
      href: "/dashboard/artist/artworks/create",
      icon: Plus,
    },
    { name: "dashboard.nav.orders", href: "/dashboard/artist/orders", icon: ShoppingBag },
    { name: "dashboard.nav.commissions", href: "/dashboard/artist/commissions", icon: FileText },
    { name: "dashboard.nav.analytics", href: "/dashboard/artist/analytics", icon: BarChart3 },
    { name: "dashboard.nav.profile", href: "/dashboard/artist/profile", icon: User },
    { name: "dashboard.nav.settings", href: "/dashboard/artist/settings", icon: Settings },
  ],
  admin: [
    { name: "dashboard.nav.dashboard", href: "/dashboard/admin", icon: LayoutDashboard, group: "Overview" },
    { name: "dashboard.nav.messages", href: "/dashboard/admin/messages", icon: MessageSquare, group: "Overview" },
    { name: "dashboard.nav.notifications", href: "/dashboard/admin/notifications", icon: Bell, group: "Overview" },
    { name: "dashboard.nav.users", href: "/dashboard/admin/users", icon: Users, group: "People" },
    {
      name: "dashboard.nav.artistVerification",
      href: "/dashboard/admin/artists",
      icon: CheckSquare,
      group: "People",
    },
    {
      name: "dashboard.nav.artworkModeration",
      href: "/dashboard/admin/artworks",
      icon: Palette,
      group: "Marketplace",
    },
    {
      name: "dashboard.nav.createArtwork",
      href: "/dashboard/admin/artworks/create",
      icon: Plus,
      group: "Marketplace",
    },
    {
      name: "dashboard.nav.auctions",
      href: "/dashboard/admin/auctions",
      icon: Gavel,
      group: "Marketplace",
    },
    {
      name: "dashboard.nav.materialRecords",
      href: "/dashboard/admin/materials",
      icon: Recycle,
      group: "Operations",
    },
    {
      name: "dashboard.nav.impactDashboard",
      href: "/dashboard/admin/impact",
      icon: BarChart3,
      group: "Operations",
    },
    { name: "dashboard.nav.orders", href: "/dashboard/admin/orders", icon: Package, group: "Operations" },
    { name: "dashboard.nav.commissions", href: "/dashboard/admin/commissions", icon: FileText, group: "Operations" },
    { name: "dashboard.nav.profile", href: "/dashboard/admin/profile", icon: User, group: "Account" },
    { name: "dashboard.nav.settings", href: "/dashboard/admin/settings", icon: Settings, group: "Account" },
  ],
};

const roleLabelKeys: Record<UserRole, string> = {
  buyer: "dashboard.layout.roleBuyer",
  artist: "dashboard.layout.roleArtist",
  admin: "dashboard.layout.roleAdmin",
};

export default function DashboardLayout({
  children,
  role,
  userName = "User",
}: DashboardLayoutProps) {
  const { t } = useTranslation();
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
    try {
      await logoutServerSession();
    } catch {
      /* even if the revoke call fails, still send the user to login */
    }
    // Hard navigation guarantees the cleared session cookie is applied and all
    // in-memory dashboard/session state is dropped.
    window.location.href = "/login";
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <AnimatedLogo size={80} animate />
        <p className="mt-4 text-sm text-gray-500">{t("dashboard.layout.checkingAccess")}</p>
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
        className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
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
            {t(roleLabelKeys[role])}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 pb-4">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || (item.href !== `/dashboard/${role}` && pathname.startsWith(`${item.href}/`));
            const previousGroup = navItems[index - 1]?.group;
            const showGroup = role === "admin" && item.group && item.group !== previousGroup;
            return (
              <div key={item.name} className={showGroup ? "mt-4 first:mt-0" : ""}>
                {showGroup && item.group && (
                  <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {t(`dashboard.navGroups.${item.group}`)}
                  </p>
                )}
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      isActive ? "text-[#007A68]" : "text-gray-400"
                    }`}
                  />
                  <span className="truncate">{t(item.name)}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="border-t border-gray-100 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <FileText className="w-5 h-5 text-gray-400" />
            {t("dashboard.layout.backToWebsite")}
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            <LogOut className="w-5 h-5" />
            {t("dashboard.layout.signOut")}
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
              {t(
                navItems.find((item) => item.href === pathname)?.name ??
                  "dashboard.layout.dashboardTitle"
              )}
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
                  {t("dashboard.layout.myProfile")}
                </Link>
                <Link
                  href={`/dashboard/${role}/settings`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t("dashboard.layout.settings")}
                </Link>
                <hr className="my-1" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  {t("dashboard.layout.signOut")}
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
