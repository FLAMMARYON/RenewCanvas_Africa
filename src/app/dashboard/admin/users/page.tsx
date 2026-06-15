"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  Filter,
  Users,
  UserCheck,
  UserX,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Shield,
  Palette,
  ShoppingBag,
  Eye,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// TODO: Replace this mock list with /api/admin/users once that API route exists.
// There is currently no existing users endpoint under src/app/api, so this page
// cannot be backed by live database data without adding a new route.
const users = [
  {
    id: "1",
    name: "Marie Uwimana",
    email: "marie@example.com",
    phone: "+250 788 123 456",
    role: "artist",
    status: "active",
    verified: true,
    joinedAt: "2026-01-15",
    artworksCount: 12,
    ordersCount: 8,
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@example.com",
    phone: "+250 788 234 567",
    role: "buyer",
    status: "active",
    verified: false,
    joinedAt: "2026-02-20",
    artworksCount: 0,
    ordersCount: 5,
  },
  {
    id: "3",
    name: "Jean Baptiste",
    email: "jean@example.com",
    phone: "+250 788 345 678",
    role: "artist",
    status: "active",
    verified: false,
    joinedAt: "2026-03-10",
    artworksCount: 6,
    ordersCount: 3,
  },
  {
    id: "4",
    name: "Sarah Miller",
    email: "sarah@example.com",
    phone: "+250 788 456 789",
    role: "buyer",
    status: "active",
    verified: false,
    joinedAt: "2026-03-25",
    artworksCount: 0,
    ordersCount: 2,
  },
  {
    id: "5",
    name: "Claudine Mukiza",
    email: "claudine@example.com",
    phone: "+250 788 567 890",
    role: "artist",
    status: "suspended",
    verified: true,
    joinedAt: "2026-01-05",
    artworksCount: 8,
    ordersCount: 10,
    suspendReason: "Policy violation",
  },
  {
    id: "6",
    name: "Michael Chen",
    email: "michael@example.com",
    phone: "+250 788 678 901",
    role: "buyer",
    status: "active",
    verified: false,
    joinedAt: "2026-04-01",
    artworksCount: 0,
    ordersCount: 1,
  },
  {
    id: "7",
    name: "Patrick Habimana",
    email: "patrick@example.com",
    phone: "+250 788 789 012",
    role: "artist",
    status: "active",
    verified: true,
    joinedAt: "2025-12-10",
    artworksCount: 15,
    ordersCount: 12,
  },
  {
    id: "8",
    name: "Emma Wilson",
    email: "emma@example.com",
    phone: "+250 788 890 123",
    role: "buyer",
    status: "inactive",
    verified: false,
    joinedAt: "2026-02-01",
    artworksCount: 0,
    ordersCount: 0,
  },
];

const roleConfig = {
  artist: {
    labelKey: "roleArtist",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: Palette,
  },
  buyer: {
    labelKey: "roleBuyer",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: ShoppingBag,
  },
  admin: {
    labelKey: "roleAdmin",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: Shield,
  },
};

const statusConfig = {
  active: {
    labelKey: "statusActive",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  inactive: {
    labelKey: "statusInactive",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  suspended: {
    labelKey: "statusSuspended",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
};

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserModal, setShowUserModal] = useState<string | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    artists: users.filter((u) => u.role === "artist").length,
    buyers: users.filter((u) => u.role === "buyer").length,
    active: users.filter((u) => u.status === "active").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((i) => i !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.users.title")}
          </h1>
          <p className="text-gray-500">{t("admin.users.subtitle")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">
                  {t("admin.users.statTotal")}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.artists}
                </p>
                <p className="text-sm text-gray-500">
                  {t("admin.users.statArtists")}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.buyers}</p>
                <p className="text-sm text-gray-500">
                  {t("admin.users.statBuyers")}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
                <p className="text-sm text-gray-500">
                  {t("admin.users.statActive")}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.suspended}
                </p>
                <p className="text-sm text-gray-500">
                  {t("admin.users.statSuspended")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t("admin.users.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">{t("admin.users.filterAllRoles")}</option>
                <option value="artist">
                  {t("admin.users.filterArtists")}
                </option>
                <option value="buyer">{t("admin.users.filterBuyers")}</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">{t("admin.users.filterAllStatus")}</option>
                <option value="active">
                  {t("admin.users.statusActive")}
                </option>
                <option value="inactive">
                  {t("admin.users.statusInactive")}
                </option>
                <option value="suspended">
                  {t("admin.users.statusSuspended")}
                </option>
              </select>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {t("admin.users.selectedCount", {
                  count: selectedUsers.length,
                })}
              </span>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t("admin.users.sendEmail")}
              </button>
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                {t("admin.users.suspend")}
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                    {t("admin.users.columnUser")}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                    {t("admin.users.columnRole")}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                    {t("admin.users.columnStatus")}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                    {t("admin.users.columnActivity")}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                    {t("admin.users.columnJoined")}
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3 w-20">
                    {t("admin.users.columnActions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const role = roleConfig[user.role as keyof typeof roleConfig];
                  const status =
                    statusConfig[user.status as keyof typeof statusConfig];
                  const RoleIcon = role.icon;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-amber-100 rounded-full flex items-center justify-center font-medium text-teal-700">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">
                                {user.name}
                              </p>
                              {user.verified && (
                                <CheckCircle className="w-4 h-4 text-blue-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${role.bgColor} ${role.color}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {t(`admin.users.${role.labelKey}`)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          {t(`admin.users.${status.labelKey}`)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          {user.role === "artist" ? (
                            <div className="flex items-center gap-3 text-gray-600">
                              <span className="flex items-center gap-1">
                                <Palette className="w-3 h-3" />
                                {user.artworksCount}
                              </span>
                              <span className="flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                {user.ordersCount}
                              </span>
                            </div>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-600">
                              <ShoppingBag className="w-3 h-3" />
                              {t("admin.users.ordersCount", {
                                count: user.ordersCount,
                              })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {user.joinedAt}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowUserModal(user.id)}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title={t("admin.users.actionViewDetails")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t("admin.users.sendEmail")}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {user.status === "active" ? (
                            <button
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title={t("admin.users.actionSuspendUser")}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title={t("admin.users.actionActivateUser")}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {t("admin.users.paginationShowing", {
                shown: filteredUsers.length,
                total: users.length,
              })}
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium">
                1
              </span>
              <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
