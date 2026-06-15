"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Bell,
  Building2,
  CreditCard,
  Globe,
  Lock,
  Mail,
  Phone,
  Shield,
  Smartphone,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { applyLocale, SUPPORTED_LOCALES, LOCALE_LABELS, isSupportedLocale, type AppLocale } from "@/i18n/config";

type TabType = "notifications" | "payouts" | "account";

// Keys mirror the server (lib/backend/notification-prefs). Each toggle persists
// immediately to /api/notifications/preferences.
interface NotificationSettings {
  emailNewOrders: boolean;
  emailCommissionRequests: boolean;
  emailArtworkStatus: boolean;
  emailPayoutUpdates: boolean;
  emailAuctionBids: boolean;
  emailNewsletter: boolean;
  pushNewOrders: boolean;
  pushCommissionRequests: boolean;
  pushPayoutProcessed: boolean;
}

type NotificationKey = keyof NotificationSettings;

interface PayoutSettings {
  payoutMethod: "bank" | "mobile_money";
  bankName: string;
  accountNumber: string;
  accountName: string;
  mobileProvider: string;
  mobileNumber: string;
}

export default function ArtistSettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("notifications");
  const [userName, setUserName] = useState("User");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNewOrders: true,
    emailCommissionRequests: true,
    emailArtworkStatus: true,
    emailPayoutUpdates: true,
    emailAuctionBids: true,
    emailNewsletter: true,
    pushNewOrders: true,
    pushCommissionRequests: true,
    pushPayoutProcessed: true,
  });

  // Persist a single toggle immediately (optimistic, then PATCH). Reverts on failure.
  const saveNotificationPref = async (key: NotificationKey, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) throw new Error("save_failed");
    } catch {
      setNotifications((prev) => ({ ...prev, [key]: !value }));
      setStatusMessage({ type: "error", message: t("artistDashboard.settings.prefSaveError") });
    }
  };

  const [payouts, setPayouts] = useState<PayoutSettings>({
    payoutMethod: "mobile_money",
    bankName: "",
    accountNumber: "",
    accountName: "",
    mobileProvider: "mtn",
    mobileNumber: "",
  });

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

    // Load notification preferences from the database (source of truth).
    fetch("/api/notifications/preferences", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ok && data.preferences) {
          setNotifications((prev) => ({ ...prev, ...data.preferences }));
        }
      })
      .catch(() => {});

    // Load payout details from the profile (source of truth).
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const p = data?.profile;
        if (!p) return;
        setPayouts((prev) => ({
          ...prev,
          payoutMethod: typeof p.payoutMethod === "string" && p.payoutMethod ? p.payoutMethod : prev.payoutMethod,
          bankName: typeof p.payoutBankName === "string" ? p.payoutBankName : prev.bankName,
          accountNumber: typeof p.payoutAccountNumber === "string" ? p.payoutAccountNumber : prev.accountNumber,
          accountName: typeof p.payoutAccountName === "string" ? p.payoutAccountName : prev.accountName,
        }));
      })
      .catch(() => {});
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      // Notification toggles persist immediately on change; this button saves
      // payout details to the profile (source of truth).
      const payoutRes = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          payoutMethod: payouts.payoutMethod,
          payoutBankName: payouts.bankName,
          payoutAccountNumber: payouts.payoutMethod === "mobile_money" ? payouts.mobileNumber : payouts.accountNumber,
          payoutAccountName: payouts.accountName,
        }),
      });

      if (!payoutRes.ok) {
        throw new Error("save_failed");
      }
      setStatusMessage({ type: "success", message: t("artistDashboard.settings.saveSuccess") });
    } catch {
      setStatusMessage({ type: "error", message: t("artistDashboard.settings.saveError") });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "notifications" as const, label: t("artistDashboard.settings.tabNotifications"), icon: Bell },
    { id: "payouts" as const, label: t("artistDashboard.settings.tabPayouts"), icon: Wallet },
    { id: "account" as const, label: t("artistDashboard.settings.tabAccount"), icon: User },
  ];

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("artistDashboard.settings.title")}</h1>
          <p className="text-gray-500">{t("artistDashboard.settings.subtitle")}</p>
        </div>

        {statusMessage && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              statusMessage.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {statusMessage.message}
          </div>
        )}

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
          {activeTab === "notifications" && (
            <NotificationsTab notifications={notifications} onToggle={saveNotificationPref} />
          )}
          {activeTab === "payouts" && <PayoutsTab payouts={payouts} setPayouts={setPayouts} />}
          {activeTab === "account" && <AccountTab />}
        </div>

        {/* Save Button */}
        {activeTab !== "account" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("artistDashboard.settings.saving")}
                </>
              ) : (
                t("artistDashboard.settings.saveChanges")
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function NotificationsTab({
  notifications,
  onToggle,
}: {
  notifications: NotificationSettings;
  onToggle: (key: NotificationKey, value: boolean) => void;
}) {
  const { t } = useTranslation();
  const Toggle = ({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-start justify-between py-3">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-teal-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t("artistDashboard.settings.emailNotifications")}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <Toggle
            checked={notifications.emailNewOrders}
            onChange={(checked) => onToggle("emailNewOrders", checked)}
            label={t("artistDashboard.settings.emailNewOrdersLabel")}
            description={t("artistDashboard.settings.emailNewOrdersDesc")}
          />
          <Toggle
            checked={notifications.emailCommissionRequests}
            onChange={(checked) => onToggle("emailCommissionRequests", checked)}
            label={t("artistDashboard.settings.emailCommissionRequestsLabel")}
            description={t("artistDashboard.settings.emailCommissionRequestsDesc")}
          />
          <Toggle
            checked={notifications.emailArtworkStatus}
            onChange={(checked) => onToggle("emailArtworkStatus", checked)}
            label={t("artistDashboard.settings.emailArtworkStatusLabel")}
            description={t("artistDashboard.settings.emailArtworkStatusDesc")}
          />
          <Toggle
            checked={notifications.emailPayoutUpdates}
            onChange={(checked) => onToggle("emailPayoutUpdates", checked)}
            label={t("artistDashboard.settings.emailPayoutUpdatesLabel")}
            description={t("artistDashboard.settings.emailPayoutUpdatesDesc")}
          />
          <Toggle
            checked={notifications.emailAuctionBids}
            onChange={(checked) => onToggle("emailAuctionBids", checked)}
            label={t("artistDashboard.settings.emailAuctionBidsLabel")}
            description={t("artistDashboard.settings.emailAuctionBidsDesc")}
          />
          <Toggle
            checked={notifications.emailNewsletter}
            onChange={(checked) => onToggle("emailNewsletter", checked)}
            label={t("artistDashboard.settings.emailNewsletterLabel")}
            description={t("artistDashboard.settings.emailNewsletterDesc")}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t("artistDashboard.settings.pushNotifications")}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <Toggle
            checked={notifications.pushNewOrders}
            onChange={(checked) => onToggle("pushNewOrders", checked)}
            label={t("artistDashboard.settings.pushNewOrdersLabel")}
            description={t("artistDashboard.settings.pushNewOrdersDesc")}
          />
          <Toggle
            checked={notifications.pushCommissionRequests}
            onChange={(checked) => onToggle("pushCommissionRequests", checked)}
            label={t("artistDashboard.settings.pushCommissionRequestsLabel")}
            description={t("artistDashboard.settings.pushCommissionRequestsDesc")}
          />
          <Toggle
            checked={notifications.pushPayoutProcessed}
            onChange={(checked) => onToggle("pushPayoutProcessed", checked)}
            label={t("artistDashboard.settings.pushPayoutProcessedLabel")}
            description={t("artistDashboard.settings.pushPayoutProcessedDesc")}
          />
        </div>
      </div>
    </div>
  );
}

function PayoutsTab({
  payouts,
  setPayouts,
}: {
  payouts: PayoutSettings;
  setPayouts: React.Dispatch<React.SetStateAction<PayoutSettings>>;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t("artistDashboard.settings.payoutMethod")}</h3>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => setPayouts((prev) => ({ ...prev, payoutMethod: "mobile_money" }))}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              payouts.payoutMethod === "mobile_money"
                ? "border-teal-600 bg-teal-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Phone className={`w-6 h-6 mb-2 ${payouts.payoutMethod === "mobile_money" ? "text-teal-600" : "text-gray-400"}`} />
            <p className="font-medium text-gray-900">{t("artistDashboard.settings.mobileMoney")}</p>
            <p className="text-sm text-gray-500">{t("artistDashboard.settings.mobileMoneyProviders")}</p>
          </button>
          <button
            type="button"
            onClick={() => setPayouts((prev) => ({ ...prev, payoutMethod: "bank" }))}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              payouts.payoutMethod === "bank"
                ? "border-teal-600 bg-teal-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Building2 className={`w-6 h-6 mb-2 ${payouts.payoutMethod === "bank" ? "text-teal-600" : "text-gray-400"}`} />
            <p className="font-medium text-gray-900">{t("artistDashboard.settings.bankTransfer")}</p>
            <p className="text-sm text-gray-500">{t("artistDashboard.settings.bankTransferDesc")}</p>
          </button>
        </div>

        {payouts.payoutMethod === "mobile_money" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="mobileProvider" className="block text-sm font-medium text-gray-700 mb-2">
                {t("artistDashboard.settings.mobileProvider")}
              </label>
              <select
                id="mobileProvider"
                value={payouts.mobileProvider}
                onChange={(e) => setPayouts((prev) => ({ ...prev, mobileProvider: e.target.value }))}
                className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="mtn">MTN Mobile Money</option>
                <option value="airtel">Airtel Money</option>
              </select>
            </div>
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">
                {t("artistDashboard.settings.mobileNumber")}
              </label>
              <input
                type="tel"
                id="mobileNumber"
                value={payouts.mobileNumber}
                onChange={(e) => setPayouts((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                placeholder="+250 7XX XXX XXX"
                className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        )}

        {payouts.payoutMethod === "bank" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                {t("artistDashboard.settings.bankName")}
              </label>
              <select
                id="bankName"
                value={payouts.bankName}
                onChange={(e) => setPayouts((prev) => ({ ...prev, bankName: e.target.value }))}
                className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">{t("artistDashboard.settings.selectBank")}</option>
                <option value="bank_of_kigali">Bank of Kigali</option>
                <option value="equity_bank">Equity Bank</option>
                <option value="i_and_m_bank">I&M Bank</option>
                <option value="kcb_bank">KCB Bank</option>
                <option value="cogebanque">Cogebanque</option>
                <option value="access_bank">Access Bank</option>
                <option value="other">{t("artistDashboard.settings.bankOther")}</option>
              </select>
            </div>
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
                {t("artistDashboard.settings.accountHolderName")}
              </label>
              <input
                type="text"
                id="accountName"
                value={payouts.accountName}
                onChange={(e) => setPayouts((prev) => ({ ...prev, accountName: e.target.value }))}
                placeholder={t("artistDashboard.settings.accountHolderNamePlaceholder")}
                className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                {t("artistDashboard.settings.accountNumber")}
              </label>
              <input
                type="text"
                id="accountNumber"
                value={payouts.accountNumber}
                onChange={(e) => setPayouts((prev) => ({ ...prev, accountNumber: e.target.value }))}
                placeholder={t("artistDashboard.settings.accountNumberPlaceholder")}
                className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
        <p className="text-sm text-blue-800">
          <strong>{t("artistDashboard.settings.commissionNoteLabel")}</strong> {t("artistDashboard.settings.commissionNoteBody")}
        </p>
      </div>
    </div>
  );
}

function AccountTab() {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
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
      if (!res.ok || !body.ok) throw new Error(body.message || t("artistDashboard.settings.emailUpdateError"));
      setCurrentEmail(body.email);
      setNewEmail("");
      setEmailMsg({ type: "success", text: t("artistDashboard.settings.emailUpdated") });
    } catch (err) {
      setEmailMsg({ type: "error", text: err instanceof Error ? err.message : t("artistDashboard.settings.emailUpdateError") });
    } finally {
      setEmailSaving(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/account/delete", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error(t("artistDashboard.settings.deleteAccountError"));
      window.location.href = "/";
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("artistDashboard.settings.deleteAccountError"));
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <LanguageSection />

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("artistDashboard.settings.accountManagement")}</h3>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{t("artistDashboard.settings.changePassword")}</p>
                <p className="text-sm text-gray-500">{t("artistDashboard.settings.changePasswordDesc")}</p>
              </div>
              <a href="/forgot-password" className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700">
                {t("artistDashboard.settings.changePassword")}
              </a>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="font-medium text-gray-900">{t("artistDashboard.settings.emailAddress")}</p>
            <p className="text-sm text-gray-500 mb-3">{t("artistDashboard.settings.currentEmail", { email: currentEmail || "—" })}</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t("artistDashboard.settings.newEmailPlaceholder")}
                aria-label={t("artistDashboard.settings.newEmailAriaLabel")}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={updateEmail}
                disabled={emailSaving || !newEmail.trim()}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {emailSaving ? t("artistDashboard.settings.updating") : t("artistDashboard.settings.updateEmail")}
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
          <h3 className="text-lg font-semibold text-red-600">{t("artistDashboard.settings.dangerZone")}</h3>
        </div>

        <div className="p-4 rounded-lg border border-red-200 bg-red-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-red-900">{t("artistDashboard.settings.deleteAccount")}</p>
              <p className="text-sm text-red-700">{t("artistDashboard.settings.deleteAccountDesc")}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 whitespace-nowrap"
            >
              {t("artistDashboard.settings.deleteAccount")}
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{t("artistDashboard.settings.deleteConfirmTitle")}</h4>
              <p className="text-gray-600 mb-3">{t("artistDashboard.settings.deleteConfirmIntro")}</p>
              <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-gray-700">
                <li>{t("artistDashboard.settings.deleteItemAccount")}</li>
                <li>{t("artistDashboard.settings.deleteItemProfile")}</li>
                <li>{t("artistDashboard.settings.deleteItemArtworks")}</li>
                <li>{t("artistDashboard.settings.deleteItemOrders")}</li>
                <li>{t("artistDashboard.settings.deleteItemPayout")}</li>
              </ul>
              <p className="mb-4 text-sm text-gray-500">{t("artistDashboard.settings.deleteCannotUndo")}</p>
              {deleteError && <p className="mb-3 text-sm text-red-600">{deleteError}</p>}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t("artistDashboard.settings.cancel")}
                </button>
                <button
                  type="button"
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? t("artistDashboard.settings.deleting") : t("artistDashboard.settings.confirmDelete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Language preference. Translates the whole site in place (JSON locale files via
 * react-i18next) and persists the choice to the database through the shared
 * applyLocale helper. English, French, Kinyarwanda, Swahili only.
 */
function LanguageSection() {
  const { t, i18n } = useTranslation();
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
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">{t("artistDashboard.settings.language")}</h3>
      </div>
      <p className="text-sm text-gray-500 mb-3">
        {t("artistDashboard.settings.languageDesc")}
      </p>
      <div className="flex items-center gap-3">
        <select
          value={current}
          onChange={onChange}
          aria-label={t("artistDashboard.settings.siteLanguageAriaLabel")}
          className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {LOCALE_LABELS[locale]}
            </option>
          ))}
        </select>
        {saved && <span className="text-sm text-green-600">{t("artistDashboard.settings.saved")}</span>}
      </div>
    </div>
  );
}
