"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Settings,
  Globe,
  Bell,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type GeneralSettings = {
  maintenanceMode: boolean;
  defaultLanguage: string;
  supportEmail: string;
};

const settingsSections = [
  { id: "general", labelKey: "tabGeneral", icon: Settings },
  { id: "notifications", labelKey: "tabNotifications", icon: Bell },
];

// Remaining admin notifications (Order Status Change / Payment Received / Refund
// Processed removed). These fire as in-app pushes from their source events and
// are listed on the notifications page.
const notificationItems = [
  { key: "newUserRegistration", labelKey: "notifNewUserRegistrationLabel", descKey: "notifNewUserRegistrationDesc" },
  { key: "newOrder", labelKey: "notifNewOrderLabel", descKey: "notifNewOrderDesc" },
  { key: "newArtistApplication", labelKey: "notifNewArtistApplicationLabel", descKey: "notifNewArtistApplicationDesc" },
  { key: "artistVerified", labelKey: "notifArtistVerifiedLabel", descKey: "notifArtistVerifiedDesc" },
  { key: "newArtwork", labelKey: "notifNewArtworkLabel", descKey: "notifNewArtworkDesc" },
];

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  const [general, setGeneral] = useState<GeneralSettings>({
    maintenanceMode: false,
    defaultLanguage: "en",
    supportEmail: "",
  });

  useEffect(() => {
    let active = true;
    fetch("/api/admin/settings", { credentials: "include" })
      .then((res) => res.json())
      .then((body) => {
        if (active && body?.ok && body.settings) setGeneral(body.settings as GeneralSettings);
      })
      .catch(() => active && setError(t("admin.settings.loadError")));
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(general),
      });
      const body = await response.json();
      if (!response.ok || !body?.ok) throw new Error(body?.message ?? t("admin.settings.saveError"));
      setGeneral(body.settings as GeneralSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("admin.settings.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("admin.settings.pageTitle")}</h1>
            <p className="text-gray-500">{t("admin.settings.pageSubtitle")}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t("admin.settings.saving")}
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                {t("admin.settings.saved")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t("admin.settings.saveChanges")}
              </>
            )}
          </button>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{t(`admin.settings.${section.labelKey}`)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              {activeSection === "general" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{t("admin.settings.generalTitle")}</h2>
                      <p className="text-sm text-gray-500">{t("admin.settings.generalSubtitle")}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="supportEmail">
                        {t("admin.settings.supportEmailLabel")}
                      </label>
                      <input
                        id="supportEmail"
                        type="email"
                        value={general.supportEmail}
                        onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="defaultLanguage">
                        {t("admin.settings.languageLabel")}
                      </label>
                      <select
                        id="defaultLanguage"
                        value={general.defaultLanguage}
                        onChange={(e) => setGeneral({ ...general, defaultLanguage: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="en">English</option>
                        <option value="rw">Kinyarwanda</option>
                        <option value="fr">Français</option>
                        <option value="sw">Kiswahili</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="font-medium text-gray-900">{t("admin.settings.maintenanceModeLabel")}</p>
                          <p className="text-sm text-gray-600">{t("admin.settings.maintenanceModeDesc")}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={general.maintenanceMode}
                        onChange={(e) => setGeneral({ ...general, maintenanceMode: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </label>
                    {general.maintenanceMode && (
                      <p className="mt-3 text-xs text-amber-700">{t("admin.settings.maintenanceModeWarning")}</p>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{t("admin.settings.notificationsTitle")}</h2>
                      <p className="text-sm text-gray-500">{t("admin.settings.notificationsSubtitle")}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm text-teal-800">
                    {t("admin.settings.notificationsPushNote")}{" "}
                    <Link href="/dashboard/admin/notifications" className="font-medium underline">
                      {t("admin.settings.notificationsViewLink")}
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {notificationItems.map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{t(`admin.settings.${item.labelKey}`)}</p>
                          <p className="text-sm text-gray-500">{t(`admin.settings.${item.descKey}`)}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          {t("admin.settings.notificationActive")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
