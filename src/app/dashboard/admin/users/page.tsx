"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { emailUser, listAdminUsers, setUserStatus, type AdminUser } from "@/lib/frontend/admin-users-api";
import {
  Search,
  Users,
  UserCheck,
  Mail,
  Calendar,
  Shield,
  Palette,
  ShoppingBag,
  Eye,
  Ban,
  CheckCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const roleConfig = {
  artist: { labelKey: "roleArtist", color: "text-purple-600", bgColor: "bg-purple-50", icon: Palette },
  buyer: { labelKey: "roleBuyer", color: "text-blue-600", bgColor: "bg-blue-50", icon: ShoppingBag },
  admin: { labelKey: "roleAdmin", color: "text-red-600", bgColor: "bg-red-50", icon: Shield },
};

const statusConfig = {
  active: { labelKey: "statusActive", color: "text-green-600", bgColor: "bg-green-50" },
  pending_verification: { labelKey: "statusPendingVerification", color: "text-amber-600", bgColor: "bg-amber-50" },
  suspended: { labelKey: "statusSuspended", color: "text-red-600", bgColor: "bg-red-50" },
};

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  // Per-user email composer (sends via Resend, not a mailto: link).
  const [notice, setNotice] = useState("");
  const [emailTarget, setEmailTarget] = useState<AdminUser | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailNotice, setEmailNotice] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    listAdminUsers()
      .then((rows) => {
        if (active) setUsers(rows);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : t("admin.users.loadError"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = useMemo(
    () => ({
      total: users.length,
      artists: users.filter((u) => u.role === "artist").length,
      buyers: users.filter((u) => u.role === "buyer").length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
    }),
    [users]
  );

  const toggleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === filteredUsers.length ? [] : filteredUsers.map((u) => u.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedUsers((current) => (current.includes(id) ? current.filter((i) => i !== id) : [...current, id]));
  };

  const handleSetStatus = async (id: string, action: "suspend" | "activate") => {
    setBusyId(id);
    setError("");
    try {
      const newStatus = await setUserStatus(id, action);
      setUsers((current) => current.map((u) => (u.id === id ? { ...u, status: newStatus } : u)));
      setDetailUser((current) => (current && current.id === id ? { ...current, status: newStatus } : current));
    } catch (mutateError) {
      setError(mutateError instanceof Error ? mutateError.message : t("admin.users.updateError"));
    } finally {
      setBusyId(null);
    }
  };

  const bulkSuspend = async () => {
    for (const id of selectedUsers) {
      const user = users.find((u) => u.id === id);
      if (user && user.status !== "suspended") await handleSetStatus(id, "suspend");
    }
    setSelectedUsers([]);
  };

  const emailSelected = () => {
    const emails = users.filter((u) => selectedUsers.includes(u.id)).map((u) => u.email);
    if (emails.length) window.location.href = `mailto:?bcc=${encodeURIComponent(emails.join(","))}`;
  };

  const openEmail = (user: AdminUser) => {
    setDetailUser(null);
    setEmailTarget(user);
    setEmailSubject("");
    setEmailBody("");
    setEmailNotice("");
  };

  const sendUserEmail = async () => {
    if (!emailTarget || emailSending) return;
    if (!emailSubject.trim() || !emailBody.trim()) {
      setEmailNotice(t("admin.users.emailValidation", { defaultValue: "Enter a subject and a message." }));
      return;
    }
    setEmailSending(true);
    setEmailNotice("");
    try {
      await emailUser(emailTarget.id, emailSubject.trim(), emailBody.trim());
      setNotice(t("admin.users.emailSentTo", { defaultValue: "Email sent to {{email}}.", email: emailTarget.email }));
      setEmailTarget(null);
    } catch (sendError) {
      // Non-blocking: surface the failure in the open composer; nothing crashes.
      setEmailNotice(sendError instanceof Error ? sendError.message : t("admin.users.emailError", { defaultValue: "Could not send the email." }));
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("admin.users.title")}</h1>
          <p className="text-gray-500">{t("admin.users.subtitle")}</p>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {notice && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} value={stats.total} label={t("admin.users.statTotal")} bg="bg-gray-100" color="text-gray-600" valueColor="text-gray-900" />
          <StatCard icon={Palette} value={stats.artists} label={t("admin.users.statArtists")} bg="bg-purple-50" color="text-purple-600" valueColor="text-purple-600" />
          <StatCard icon={ShoppingBag} value={stats.buyers} label={t("admin.users.statBuyers")} bg="bg-blue-50" color="text-blue-600" valueColor="text-blue-600" />
          <StatCard icon={UserCheck} value={stats.active} label={t("admin.users.statActive")} bg="bg-green-50" color="text-green-600" valueColor="text-green-600" />
          <StatCard icon={Ban} value={stats.suspended} label={t("admin.users.statSuspended")} bg="bg-red-50" color="text-red-600" valueColor="text-red-600" />
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
                aria-label={t("admin.users.columnRole")}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">{t("admin.users.filterAllRoles")}</option>
                <option value="artist">{t("admin.users.filterArtists")}</option>
                <option value="buyer">{t("admin.users.filterBuyers")}</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label={t("admin.users.columnStatus")}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
              >
                <option value="all">{t("admin.users.filterAllStatus")}</option>
                <option value="active">{t("admin.users.statusActive")}</option>
                <option value="pending_verification">{t("admin.users.statusPendingVerification")}</option>
                <option value="suspended">{t("admin.users.statusSuspended")}</option>
              </select>
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4">
              <span className="text-sm text-gray-600">{t("admin.users.selectedCount", { count: selectedUsers.length })}</span>
              <button type="button" onClick={emailSelected} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                {t("admin.users.sendEmail")}
              </button>
              <button type="button" onClick={bulkSuspend} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
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
                      checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                      onChange={toggleSelectAll}
                      aria-label={t("admin.users.columnUser")}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">{t("admin.users.columnUser")}</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">{t("admin.users.columnRole")}</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">{t("admin.users.columnStatus")}</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">{t("admin.users.columnActivity")}</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3">{t("admin.users.columnJoined")}</th>
                  <th className="text-left text-sm font-medium text-gray-500 px-4 py-3 w-20">{t("admin.users.columnActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const role = roleConfig[user.role as keyof typeof roleConfig] ?? roleConfig.buyer;
                  const status = statusConfig[user.status as keyof typeof statusConfig] ?? statusConfig.active;
                  const RoleIcon = role.icon;
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          aria-label={user.name}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-amber-100 rounded-full flex items-center justify-center font-medium text-teal-700">
                            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900">{user.name}</p>
                              {user.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${role.bgColor} ${role.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {t(`admin.users.${role.labelKey}`)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                          {t(`admin.users.${status.labelKey}`)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          {user.role === "artist" ? (
                            <div className="flex items-center gap-3 text-gray-600">
                              <span className="flex items-center gap-1"><Palette className="w-3 h-3" />{user.artworksCount}</span>
                              <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{user.ordersCount}</span>
                            </div>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-600">
                              <ShoppingBag className="w-3 h-3" />
                              {t("admin.users.ordersCount", { count: user.ordersCount })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.joinedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailUser(user)}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title={t("admin.users.actionViewDetails")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEmail(user)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t("admin.users.sendEmail")}
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          {user.status === "suspended" ? (
                            <button
                              type="button"
                              disabled={busyId === user.id}
                              onClick={() => handleSetStatus(user.id, "activate")}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t("admin.users.actionActivateUser")}
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busyId === user.id}
                              onClick={() => handleSetStatus(user.id, "suspend")}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t("admin.users.actionSuspendUser")}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500">{t("admin.users.empty")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {loading ? t("admin.users.loading") : t("admin.users.paginationShowing", { shown: filteredUsers.length, total: users.length })}
            </p>
          </div>
        </div>
      </div>

      {detailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetailUser(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t("admin.users.actionViewDetails")}</h2>
              <button type="button" onClick={() => setDetailUser(null)} className="p-1 text-gray-400 hover:text-gray-600" aria-label={t("admin.users.close")}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <DetailRow label={t("admin.users.columnUser")} value={detailUser.name} />
              <DetailRow label="Email" value={detailUser.email} />
              <DetailRow label="Phone" value={detailUser.phone ?? "-"} />
              <DetailRow label={t("admin.users.columnRole")} value={t(`admin.users.${(roleConfig[detailUser.role as keyof typeof roleConfig] ?? roleConfig.buyer).labelKey}`)} />
              <DetailRow label={t("admin.users.columnStatus")} value={t(`admin.users.${(statusConfig[detailUser.status as keyof typeof statusConfig] ?? statusConfig.active).labelKey}`)} />
              <DetailRow label={t("admin.users.columnActivity")} value={`${detailUser.artworksCount} artworks · ${detailUser.ordersCount} orders`} />
              <DetailRow label={t("admin.users.columnJoined")} value={new Date(detailUser.joinedAt).toLocaleDateString()} />
              {detailUser.role === "artist" && (
                <>
                  <DetailRow
                    label={t("admin.users.payoutMethod", { defaultValue: "Payout method" })}
                    value={detailUser.payoutMethod || t("admin.users.payoutMomoDefault", { defaultValue: "MTN Mobile Money" })}
                  />
                  <DetailRow
                    label={t("admin.users.payoutNumber", { defaultValue: "MoMo number" })}
                    value={detailUser.payoutNumber || detailUser.phone || "-"}
                  />
                  <DetailRow
                    label={t("admin.users.payoutAccountName", { defaultValue: "Payout name" })}
                    value={detailUser.payoutAccountName || detailUser.name || "-"}
                  />
                </>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => openEmail(detailUser)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Mail className="w-4 h-4" />{t("admin.users.sendEmail")}
              </button>
              {detailUser.status === "suspended" ? (
                <button type="button" disabled={busyId === detailUser.id} onClick={() => handleSetStatus(detailUser.id, "activate")} className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                  {t("admin.users.actionActivateUser")}
                </button>
              ) : (
                <button type="button" disabled={busyId === detailUser.id} onClick={() => handleSetStatus(detailUser.id, "suspend")} className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {t("admin.users.actionSuspendUser")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {emailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !emailSending && setEmailTarget(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t("admin.users.emailModalTitle", { defaultValue: "Email user" })}</h2>
              <button type="button" onClick={() => setEmailTarget(null)} disabled={emailSending} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50" aria-label={t("admin.users.close")}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">{emailTarget.name} · {emailTarget.email}</p>

            {emailNotice && <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{emailNotice}</div>}

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="user-email-subject" className="mb-1 block text-sm font-medium text-gray-700">{t("admin.users.emailSubjectLabel", { defaultValue: "Subject" })}</label>
                <input
                  id="user-email-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  disabled={emailSending}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="user-email-body" className="mb-1 block text-sm font-medium text-gray-700">{t("admin.users.emailMessageLabel", { defaultValue: "Message" })}</label>
                <textarea
                  id="user-email-body"
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  disabled={emailSending}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setEmailTarget(null)} disabled={emailSending} className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                {t("admin.users.emailCancel", { defaultValue: "Cancel" })}
              </button>
              <button type="button" onClick={sendUserEmail} disabled={emailSending} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
                <Mail className="w-4 h-4" />
                {emailSending ? t("admin.users.emailSending", { defaultValue: "Sending…" }) : t("admin.users.emailSendAction", { defaultValue: "Send email" })}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, value, label, bg, color, valueColor }: { icon: typeof Users; value: number; label: string; bg: string; color: string; valueColor: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}
