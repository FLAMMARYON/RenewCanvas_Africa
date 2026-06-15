"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  listAdminNotifications,
  markAdminNotificationRead,
  type AdminNotification,
} from "@/lib/frontend/admin-notifications-api";
import { Bell, CheckCheck, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AdminNotificationsPage() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listAdminNotifications()
      .then((rows) => active && setNotifications(rows))
      .catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : t("admin.notifications.loadError")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRead = async (input: { id?: string; all?: boolean }) => {
    try {
      setNotifications(await markAdminNotificationRead(input));
    } catch (mutateError) {
      setError(mutateError instanceof Error ? mutateError.message : t("admin.notifications.updateError"));
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("admin.notifications.title")}</h1>
            <p className="text-gray-500">{t("admin.notifications.subtitle")}</p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => handleRead({ all: true })}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CheckCheck className="w-4 h-4" />
              {t("admin.notifications.markAllRead")}
            </button>
          )}
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-100">
          {loading && <p className="p-6 text-sm text-gray-500">{t("admin.notifications.loading")}</p>}
          {!loading && notifications.length === 0 && (
            <div className="p-12 text-center">
              <Bell className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-1 font-medium text-gray-900">{t("admin.notifications.emptyTitle")}</h3>
              <p className="text-gray-500">{t("admin.notifications.emptyHint")}</p>
            </div>
          )}
          {notifications.map((notification) => (
            <div key={notification.id} className={`flex items-start gap-4 p-4 ${notification.read ? "bg-white" : "bg-teal-50/40"}`}>
              <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${notification.read ? "bg-gray-100 text-gray-500" : "bg-teal-100 text-teal-600"}`}>
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{notification.subject ?? notification.templateKey}</p>
                  {!notification.read && <span className="inline-block h-2 w-2 rounded-full bg-teal-500" />}
                </div>
                <p className="mt-0.5 text-sm text-gray-600">{notification.body}</p>
                <p className="mt-1 text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</p>
              </div>
              {!notification.read && (
                <button
                  type="button"
                  onClick={() => handleRead({ id: notification.id })}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  {t("admin.notifications.markRead")}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
