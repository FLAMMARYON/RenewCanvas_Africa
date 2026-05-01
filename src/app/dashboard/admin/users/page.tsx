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

// Mock users data
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
    label: "Artist",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: Palette,
  },
  buyer: {
    label: "Buyer",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: ShoppingBag,
  },
  admin: {
    label: "Admin",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: Shield,
  },
};

const statusConfig = {
  active: {
    label: "Active",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  inactive: {
    label: "Inactive",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
  suspended: {
    label: "Suspended",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
};

export default function AdminUsersPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage all platform users</p>
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
                <p className="text-sm text-gray-500">Total Users</p>
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
                <p className="text-sm text-gray-500">Artists</p>
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
                <p className="text-sm text-gray-500">Buyers</p>
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
                <p className="text-sm text-gray-500">Active</p>
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
                <p className="text-sm text-gray-500">Suspended</p>
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
                placeholder="Search by name or email..."
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
                <option value="all">All Roles</option>
                <option value="artist">Artists</option>
                <option value="buyer">Buyers</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} selected
              </span>
              <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                Send Email
              </button>
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Suspend
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
                    User
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                    Role
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                    Status
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                    Activity
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">
                    Joined
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3 w-20">
                    Actions
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
                          {role.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          {status.label}
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
                              {user.ordersCount} orders
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
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {user.status === "active" ? (
                            <button
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Suspend User"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Activate User"
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
              Showing {filteredUsers.length} of {users.length} users
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
