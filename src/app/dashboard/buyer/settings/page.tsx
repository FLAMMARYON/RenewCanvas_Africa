"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Bell, Globe, Lock, Mail, Shield, Smartphone, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";

type TabType = "preferences" | "notifications" | "privacy" | "account";

interface NotificationSettings {
  emailOrderUpdates: boolean;
  emailNewArtwork: boolean;
  emailArtistUpdates: boolean;
  emailNewsletter: boolean;
  emailAuctions: boolean;
  pushOrderUpdates: boolean;
  pushAuctions: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private";
  showWishlist: boolean;
  showPurchaseHistory: boolean;
  allowAnalytics: boolean;
}

interface PreferenceSettings {
  language: string;
  currency: string;
  measurementUnit: "metric" | "imperial";
}

export default function BuyerSettingsPage() {
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
    emailOrderUpdates: true,
    emailNewArtwork: true,
    emailArtistUpdates: false,
    emailNewsletter: true,
    emailAuctions: true,
    pushOrderUpdates: true,
    pushAuctions: false,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "public",
    showWishlist: true,
    showPurchaseHistory: false,
    allowAnalytics: true,
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
    const savedPreferences = localStorage.getItem("buyer_preferences");
    const savedNotifications = localStorage.getItem("buyer_notifications");
    const savedPrivacy = localStorage.getItem("buyer_privacy");

    if (savedPreferences) setPreferences(JSON.parse(savedPreferences));
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      // Save to localStorage for now (can be migrated to API later)
      localStorage.setItem("buyer_preferences", JSON.stringify(preferences));
      localStorage.setItem("buyer_notifications", JSON.stringify(notifications));
      localStorage.setItem("buyer_privacy", JSON.stringify(privacy));

      // Also save to server if notification preferences API exists
      try {
        await fetch("/api/notifications/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrderUpdates: notifications.emailOrderUpdates,
            emailNewArtwork: notifications.emailNewArtwork,
            emailArtistUpdates: notifications.emailArtistUpdates,
            emailNewsletter: notifications.emailNewsletter,
            emailAuctions: notifications.emailAuctions,
            pushOrderUpdates: notifications.pushOrderUpdates,
            pushAuctions: notifications.pushAuctions,
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
    { id: "privacy" as const, label: "Privacy", icon: Shield },
    { id: "account" as const, label: "Account", icon: User },
  ];

  return (
    <DashboardLayout role="buyer" userName={userName}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your account preferences and privacy settings</p>
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
              Currency
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
              Measurement Units
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
            checked={notifications.emailOrderUpdates}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailOrderUpdates: checked }))
            }
            label="Order Updates"
            description="Receive updates about your orders, shipping, and delivery"
          />
          <Toggle
            checked={notifications.emailNewArtwork}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailNewArtwork: checked }))
            }
            label="New Artwork"
            description="Get notified when artists you follow add new artwork"
          />
          <Toggle
            checked={notifications.emailArtistUpdates}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailArtistUpdates: checked }))
            }
            label="Artist Updates"
            description="Receive updates and news from your favorite artists"
          />
          <Toggle
            checked={notifications.emailAuctions}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailAuctions: checked }))
            }
            label="Auction Alerts"
            description="Get notified about new auctions and bidding updates"
          />
          <Toggle
            checked={notifications.emailNewsletter}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, emailNewsletter: checked }))
            }
            label="Newsletter"
            description="Receive our weekly newsletter with featured art and impact stories"
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
            checked={notifications.pushOrderUpdates}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, pushOrderUpdates: checked }))
            }
            label="Order Updates"
            description="Receive real-time updates about your orders"
          />
          <Toggle
            checked={notifications.pushAuctions}
            onChange={(checked) =>
              setNotifications((prev) => ({ ...prev, pushAuctions: checked }))
            }
            label="Auction Alerts"
            description="Get notified when you're outbid or an auction ends"
          />
        </div>
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
            <option value="public">Public - Anyone can view your profile</option>
            <option value="private">Private - Only you can view your profile</option>
          </select>
        </div>

        <div className="divide-y divide-gray-100">
          <Toggle
            checked={privacy.showWishlist}
            onChange={(checked) => setPrivacy((prev) => ({ ...prev, showWishlist: checked }))}
            label="Show Wishlist"
            description="Allow others to see your wishlist on your public profile"
          />
          <Toggle
            checked={privacy.showPurchaseHistory}
            onChange={(checked) =>
              setPrivacy((prev) => ({ ...prev, showPurchaseHistory: checked }))
            }
            label="Show Purchase History"
            description="Display artworks you've purchased on your public profile"
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
                href="/dashboard/buyer/profile"
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
                <p className="text-sm text-gray-500">Get a copy of all your account data</p>
              </div>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Request Download
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
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100"
            >
              Delete Account
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 max-w-md mx-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Delete Account?</h4>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete your account? All your data, including orders,
                wishlist, and profile information will be permanently removed. This action cannot be
                undone.
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
