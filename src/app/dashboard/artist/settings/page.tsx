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

type TabType = "preferences" | "notifications" | "payouts" | "privacy" | "account";

interface NotificationSettings {
  emailOrderReceived: boolean;
  emailCommissionRequest: boolean;
  emailArtworkApproved: boolean;
  emailPayoutProcessed: boolean;
  emailNewsletter: boolean;
  emailAuctions: boolean;
  pushOrderReceived: boolean;
  pushCommissionRequest: boolean;
  pushPayoutProcessed: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private";
  showEarnings: boolean;
  showSalesCount: boolean;
  allowAnalytics: boolean;
}

interface PreferenceSettings {
  language: string;
  currency: string;
  measurementUnit: "metric" | "imperial";
}

interface PayoutSettings {
  payoutMethod: "bank" | "mobile_money";
  bankName: string;
  accountNumber: string;
  accountName: string;
  mobileProvider: string;
  mobileNumber: string;
  payoutSchedule: "weekly" | "biweekly" | "monthly" | "on_demand";
  minimumPayout: number;
}

export default function ArtistSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("preferences");
  const [userName, setUserName] = useState("User");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [preferences, setPreferences] = useState<PreferenceSettings>({
    language: "en",
    currency: "RWF",
    measurementUnit: "metric",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailOrderReceived: true,
    emailCommissionRequest: true,
    emailArtworkApproved: true,
    emailPayoutProcessed: true,
    emailNewsletter: true,
    emailAuctions: true,
    pushOrderReceived: true,
    pushCommissionRequest: true,
    pushPayoutProcessed: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "public",
    showEarnings: false,
    showSalesCount: true,
    allowAnalytics: true,
  });

  const [payouts, setPayouts] = useState<PayoutSettings>({
    payoutMethod: "mobile_money",
    bankName: "",
    accountNumber: "",
    accountName: "",
    mobileProvider: "mtn",
    mobileNumber: "",
    payoutSchedule: "biweekly",
    minimumPayout: 50000,
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

    // Load saved settings from localStorage
    const savedPreferences = localStorage.getItem("artist_preferences");
    const savedNotifications = localStorage.getItem("artist_notifications");
    const savedPrivacy = localStorage.getItem("artist_privacy");
    const savedPayouts = localStorage.getItem("artist_payouts");

    if (savedPreferences) setPreferences(JSON.parse(savedPreferences));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
    if (savedPayouts) setPayouts(JSON.parse(savedPayouts));
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      // Save to localStorage for now (can be migrated to API later)
      localStorage.setItem("artist_preferences", JSON.stringify(preferences));
      localStorage.setItem("artist_notifications", JSON.stringify(notifications));
      localStorage.setItem("artist_privacy", JSON.stringify(privacy));
      localStorage.setItem("artist_payouts", JSON.stringify(payouts));

      // Also save to server if notification preferences API exists
      try {
        await fetch("/api/notifications/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrderReceived: notifications.emailOrderReceived,
            emailCommissionRequest: notifications.emailCommissionRequest,
            emailArtworkApproved: notifications.emailArtworkApproved,
            emailPayoutProcessed: notifications.emailPayoutProcessed,
            emailNewsletter: notifications.emailNewsletter,
            emailAuctions: notifications.emailAuctions,
            pushOrderReceived: notifications.pushOrderReceived,
            pushCommissionRequest: notifications.pushCommissionRequest,
            pushPayoutProcessed: notifications.pushPayoutProcessed,
          }),
        });
      } catch {
        // API may not exist yet, ignore
      }

      setStatusMessage({ type: "success", message: "Settings saved successfully!" });
    } catch {
      setStatusMessage({ type: "error", message: "Failed to save settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "preferences" as const, label: "Preferences", icon: Globe },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "payouts" as const, label: "Payouts", icon: Wallet },
    { id: "privacy" as const, label: "Privacy", icon: Shield },
    { id: "account" as const, label: "Account", icon: User },
  ];

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your account, payout preferences, and privacy settings</p>
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
          {activeTab === "preferences" && (
            <PreferencesTab preferences={preferences} setPreferences={setPreferences} />
          )}
          {activeTab === "notifications" && (
            <NotificationsTab notifications={notifications} setNotifications={setNotifications} />
          )}
          {activeTab === "payouts" && <PayoutsTab payouts={payouts} setPayouts={setPayouts} />}
          {activeTab === "privacy" && <PrivacyTab privacy={privacy} setPrivacy={setPrivacy} />}
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function PreferencesTab({
  preferences,
  setPreferences,
}: {
  preferences: PreferenceSettings;
  setPreferences: React.Dispatch<React.SetStateAction<PreferenceSettings>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              id="language"
              value={preferences.language}
              onChange={(e) => setPreferences((prev) => ({ ...prev, language: e.target.value }))}
              className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="rw">Kinyarwanda</option>
              <option value="sw">Swahili</option>
            </select>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Currency (for display)
            </label>
            <select
              id="currency"
              value={preferences.currency}
              onChange={(e) => setPreferences((prev) => ({ ...prev, currency: e.target.value }))}
              className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="RWF">Rwandan Franc (RWF)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="KES">Kenyan Shilling (KES)</option>
              <option value="NGN">Nigerian Naira (NGN)</option>
            </select>
          </div>

          <div>
            <label htmlFor="measurement" className="block text-sm font-medium text-gray-700 mb-2">
              Measurement Units (for artwork dimensions)
            </label>
            <select
              id="measurement"
              value={preferences.measurementUnit}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  measurementUnit: e.target.value as "metric" | "imperial",
                }))
              }
              className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="metric">Metric (cm, kg)</option>
              <option value="imperial">Imperial (in, lb)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({
  notifications,
  setNotifications,
}: {
  notifications: NotificationSettings;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationSettings>>;
}) {
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
          <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <Toggle
            checked={notifications.emailOrderReceived}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailOrderReceived: checked }))
            }
            label="New Orders"
            description="Get notified when someone purchases your artwork"
          />
          <Toggle
            checked={notifications.emailCommissionRequest}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailCommissionRequest: checked }))
            }
            label="Commission Requests"
            description="Receive alerts for new custom artwork requests"
          />
          <Toggle
            checked={notifications.emailArtworkApproved}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailArtworkApproved: checked }))
            }
            label="Artwork Status"
            description="Get notified when your artwork is approved or needs changes"
          />
          <Toggle
            checked={notifications.emailPayoutProcessed}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailPayoutProcessed: checked }))
            }
            label="Payout Updates"
            description="Receive notifications when payouts are processed"
          />
          <Toggle
            checked={notifications.emailAuctions}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailAuctions: checked }))
            }
            label="Auction Updates"
            description="Get notified about bids on your auctioned artworks"
          />
          <Toggle
            checked={notifications.emailNewsletter}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailNewsletter: checked }))
            }
            label="Newsletter"
            description="Receive platform updates, tips, and community news"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <Toggle
            checked={notifications.pushOrderReceived}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, pushOrderReceived: checked }))
            }
            label="New Orders"
            description="Receive real-time alerts for new orders"
          />
          <Toggle
            checked={notifications.pushCommissionRequest}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, pushCommissionRequest: checked }))
            }
            label="Commission Requests"
            description="Get instant alerts for new commission requests"
          />
          <Toggle
            checked={notifications.pushPayoutProcessed}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, pushPayoutProcessed: checked }))
            }
            label="Payout Processed"
            description="Get notified when your payout is sent"
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
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payout Method</h3>
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
            <p className="font-medium text-gray-900">Mobile Money</p>
            <p className="text-sm text-gray-500">MTN MoMo, Airtel Money</p>
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
            <p className="font-medium text-gray-900">Bank Transfer</p>
            <p className="text-sm text-gray-500">Direct bank deposit</p>
          </button>
        </div>

        {payouts.payoutMethod === "mobile_money" && (
          <div className="space-y-4">
            <div>
              <label htmlFor="mobileProvider" className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Provider
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
                Mobile Number
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
                Bank Name
              </label>
              <select
                id="bankName"
                value={payouts.bankName}
                onChange={(e) => setPayouts((prev) => ({ ...prev, bankName: e.target.value }))}
                className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select a bank</option>
                <option value="bank_of_kigali">Bank of Kigali</option>
                <option value="equity_bank">Equity Bank</option>
                <option value="i_and_m_bank">I&M Bank</option>
                <option value="kcb_bank">KCB Bank</option>
                <option value="cogebanque">Cogebanque</option>
                <option value="access_bank">Access Bank</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                id="accountName"
                value={payouts.accountName}
                onChange={(e) => setPayouts((prev) => ({ ...prev, accountName: e.target.value }))}
                placeholder="As shown on bank account"
                className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                id="accountNumber"
                value={payouts.accountNumber}
                onChange={(e) => setPayouts((prev) => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Enter account number"
                className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payout Schedule</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="payoutSchedule" className="block text-sm font-medium text-gray-700 mb-2">
              When should we send your earnings?
            </label>
            <select
              id="payoutSchedule"
              value={payouts.payoutSchedule}
              onChange={(e) =>
                setPayouts((prev) => ({
                  ...prev,
                  payoutSchedule: e.target.value as PayoutSettings["payoutSchedule"],
                }))
              }
              className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="weekly">Weekly (Every Monday)</option>
              <option value="biweekly">Bi-weekly (Every other Monday)</option>
              <option value="monthly">Monthly (1st of month)</option>
              <option value="on_demand">On Demand (Manual request)</option>
            </select>
          </div>

          <div>
            <label htmlFor="minimumPayout" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Payout Amount (RWF)
            </label>
            <select
              id="minimumPayout"
              value={payouts.minimumPayout}
              onChange={(e) =>
                setPayouts((prev) => ({ ...prev, minimumPayout: Number(e.target.value) }))
              }
              className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={10000}>10,000 RWF</option>
              <option value={25000}>25,000 RWF</option>
              <option value={50000}>50,000 RWF</option>
              <option value={100000}>100,000 RWF</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">Payouts below this amount will be held until the threshold is met</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> RenewCanvas takes a 20% platform commission. You receive 80% of each sale. Commission is automatically deducted before payout.
        </p>
      </div>
    </div>
  );
}

function PrivacyTab({
  privacy,
  setPrivacy,
}: {
  privacy: PrivacySettings;
  setPrivacy: React.Dispatch<React.SetStateAction<PrivacySettings>>;
}) {
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
          <Lock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Profile Privacy</h3>
        </div>

        <div className="mb-4">
          <label htmlFor="profileVisibility" className="block text-sm font-medium text-gray-700 mb-2">
            Profile Visibility
          </label>
          <select
            id="profileVisibility"
            value={privacy.profileVisibility}
            onChange={(e) =>
              setPrivacy((prev) => ({
                ...prev,
                profileVisibility: e.target.value as "public" | "private",
              }))
            }
            className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="public">Public - Buyers can find and view your profile</option>
            <option value="private">Private - Only visible to logged-in users</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">We recommend keeping your profile public to attract buyers</p>
        </div>

        <div className="divide-y divide-gray-100">
          <Toggle
            checked={privacy.showEarnings}
            onChange={(checked) => setPrivacy((prev) => ({ ...prev, showEarnings: checked }))}
            label="Show Earnings"
            description="Display your total earnings on your public profile"
          />
          <Toggle
            checked={privacy.showSalesCount}
            onChange={(checked) =>
              setPrivacy((prev) => ({ ...prev, showSalesCount: checked }))
            }
            label="Show Sales Count"
            description="Display how many artworks you've sold on your profile"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Data & Analytics</h3>
        </div>
        <div className="divide-y divide-gray-100">
          <Toggle
            checked={privacy.allowAnalytics}
            onChange={(checked) => setPrivacy((prev) => ({ ...prev, allowAnalytics: checked }))}
            label="Usage Analytics"
            description="Help us improve the platform by sharing anonymous usage data"
          />
        </div>
      </div>
    </div>
  );
}

function AccountTab() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h3>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">Update your password for security</p>
              </div>
              <a
                href="/forgot-password"
                className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Change Password
              </a>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Address</p>
                <p className="text-sm text-gray-500">Change your account email address</p>
              </div>
              <a
                href="/dashboard/artist/profile"
                className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Update Email
              </a>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Download Your Data</p>
                <p className="text-sm text-gray-500">Get a copy of all your account data including artwork</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Request Download
              </button>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Export Artwork Catalog</p>
                <p className="text-sm text-gray-500">Download a spreadsheet of all your listed artworks</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
        </div>

        <div className="p-4 rounded-lg border border-red-200 bg-red-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">
                Permanently delete your artist account, all artworks, and earnings data. Pending payouts will still be processed. This action cannot be undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Artist Account?</h4>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete your artist account? All your artworks, orders,
                analytics, and profile information will be permanently removed. Any pending payouts
                will still be processed before deletion. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Yes, Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
