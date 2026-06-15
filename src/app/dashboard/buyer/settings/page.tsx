"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Globe, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { applyLocale, SUPPORTED_LOCALES, LOCALE_LABELS, isSupportedLocale, type AppLocale } from "@/i18n/config";

type TabType = "preferences" | "account";

export default function BuyerSettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("preferences");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile?.firstName) {
          setUserName(data.profile.firstName);
        } else if (data?.user?.name) {
          setUserName(data.user.name.split(" ")[0]);
        }
      })
      .catch(() => {});
  }, []);

  const tabs = [
    { id: "preferences" as const, label: t("dashboard.buyer.settings.tabPreferences"), icon: Globe },
    { id: "account" as const, label: t("dashboard.buyer.settings.tabAccount"), icon: User },
  ];

  return (
    <DashboardLayout role="buyer" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.buyer.settings.title")}</h1>
          <p className="text-gray-500">{t("dashboard.buyer.settings.subtitle")}</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          {activeTab === "preferences" && <PreferencesTab />}
          {activeTab === "account" && <AccountTab />}
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Language preference. Translates the whole site in place (JSON locale files via
 * react-i18next) and persists the choice through the shared applyLocale helper.
 * English, French, Kinyarwanda, Swahili only. (Currency is fixed to RWF and
 * units to cm/kg — those are not user-configurable.)
 */
function PreferencesTab() {
  const { i18n, t } = useTranslation();
  const [saved, setSaved] = useState(false);
  const current: AppLocale = isSupportedLocale(i18n.language) ? i18n.language : "en";

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (!isSupportedLocale(next)) return;
    applyLocale(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.buyer.settings.displayPreferences")}</h3>
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
            {t("common.language")}
          </label>
          <div className="flex items-center gap-3">
            <select
              id="language"
              value={current}
              onChange={onChange}
              className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {SUPPORTED_LOCALES.map((locale) => (
                <option key={locale} value={locale}>
                  {LOCALE_LABELS[locale]}
                </option>
              ))}
            </select>
            {saved && <span className="text-sm text-green-600">{t("dashboard.buyer.settings.savedShort")}</span>}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {t("dashboard.buyer.settings.languageHelp")}
          </p>
        </div>
      </div>
    </div>
  );
}

function AccountTab() {
  const { t } = useTranslation();
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.email) setCurrentEmail(data.user.email);
      })
      .catch(() => {});
  }, []);

  const updateEmail = async () => {
    setEmailSaving(true);
    setEmailMsg(null);
    try {
      const res = await fetch("/api/auth/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.message || t("dashboard.buyer.settings.emailUpdateError"));
      setCurrentEmail(body.email);
      setNewEmail("");
      setEmailMsg({ type: "success", text: t("dashboard.buyer.settings.emailUpdated") });
    } catch (err) {
      setEmailMsg({ type: "error", text: err instanceof Error ? err.message : t("dashboard.buyer.settings.emailUpdateError") });
    } finally {
      setEmailSaving(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/account/delete", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error(t("dashboard.deleteAccountError"));
      window.location.href = "/";
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("dashboard.deleteAccountError"));
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("dashboard.buyer.settings.accountManagement")}</h3>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{t("dashboard.buyer.settings.changePassword")}</p>
                <p className="text-sm text-gray-500">{t("dashboard.buyer.settings.changePasswordDesc")}</p>
              </div>
              <a href="/forgot-password" className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700">
                {t("dashboard.buyer.settings.changePassword")}
              </a>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{t("dashboard.buyer.settings.emailAddress")}</p>
            <p className="text-sm text-gray-500 mb-3">{t("dashboard.buyer.settings.currentPrefix", { email: currentEmail || "—" })}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t("dashboard.buyer.settings.newEmailPlaceholder")}
                aria-label={t("dashboard.buyer.settings.newEmailAria")}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={updateEmail}
                disabled={emailSaving || !newEmail.trim()}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {emailSaving ? t("dashboard.buyer.settings.updatingEmail") : t("dashboard.buyer.settings.updateEmail")}
              </button>
            </div>
            {emailMsg && (
              <p className={`mt-2 text-sm ${emailMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{emailMsg.text}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-600">{t("dashboard.buyer.settings.dangerZone")}</h3>
        </div>

        <div className="p-4 rounded-lg border border-red-200 bg-red-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-red-900">{t("dashboard.buyer.settings.deleteAccount")}</p>
              <p className="text-sm text-red-700">
                {t("dashboard.buyer.settings.deleteAccountDesc")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 whitespace-nowrap"
            >
              {t("dashboard.buyer.settings.deleteAccount")}
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{t("dashboard.deleteModal.title")}</h4>
              <p className="text-gray-600 mb-3">{t("dashboard.deleteModal.intro")}</p>
              <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-gray-700">
                <li>{t("dashboard.deleteModal.bullet1")}</li>
                <li>{t("dashboard.deleteModal.bullet2")}</li>
                <li>{t("dashboard.deleteModal.bullet3")}</li>
              </ul>
              {deleteError && <p className="mb-3 text-sm text-red-600">{deleteError}</p>}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t("dashboard.deleteModal.cancel")}
                </button>
                <button
                  type="button"
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? t("dashboard.deleteModal.deleting") : t("dashboard.deleteModal.confirm")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
