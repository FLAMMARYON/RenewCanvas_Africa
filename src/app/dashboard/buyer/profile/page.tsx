"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  CheckCircle,
  Bell,
  Shield,
  CreditCard,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { readProfile, saveProfile } from "@/lib/frontend/profile-api";
import { emitProfileUpdated } from "@/lib/frontend/profile-events";

const initialProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "Rwanda",
  notifications: {
    orderUpdates: true,
    promotions: false,
    newArtworks: true,
    artistUpdates: true,
  },
};

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export default function BuyerProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [userName, setUserName] = useState("User");

  // Avatar upload (persisted via /api/profile/avatar → BuyerProfile.avatarUrl).
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password change.
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Account deletion.
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const uploadAvatar = async (file: File) => {
    setAvatarUploading(true);
    setStatusMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd, credentials: "include" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.message || t("dashboard.buyer.profile.uploadError"));
      setAvatarUrl(body.avatarUrl);
      // Refresh the navbar/header avatar everywhere it shows.
      emitProfileUpdated();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : t("dashboard.buyer.profile.uploadError"));
    } finally {
      setAvatarUploading(false);
    }
  };

  const updatePassword = async () => {
    setPwMsg(null);
    if (pw.newPassword !== pw.confirmPassword) {
      setPwMsg({ type: "error", text: t("dashboard.buyer.profile.pwMismatch") });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/password-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: pw.currentPassword, newPassword: pw.newPassword }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) {
        const msg = body?.errors ? Object.values(body.errors).flat().join(" ") : body.message;
        throw new Error(msg || t("dashboard.buyer.profile.pwUpdateError"));
      }
      // All sessions were revoked server-side — send the user to sign in again.
      window.location.href = "/login";
    } catch (err) {
      setPwMsg({ type: "error", text: err instanceof Error ? err.message : t("dashboard.buyer.profile.pwUpdateError") });
      setPwSaving(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/account/delete", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error(t("dashboard.buyer.profile.deleteError"));
      window.location.href = "/";
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t("dashboard.buyer.profile.deleteError"));
      setDeleting(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile() {
      try {
        const payload = await readProfile();
        if (!isCurrent) return;
        const profileData = payload.profile;
        const address = payload.address;

        setAvatarUrl(typeof profileData.avatarUrl === "string" ? profileData.avatarUrl : null);
        setProfile({
          firstName: stringValue(profileData.firstName),
          lastName: stringValue(profileData.lastName),
          email: payload.user.email,
          phone: stringValue(profileData.phone),
          address: stringValue(address?.line1),
          city: stringValue(address?.city),
          country: stringValue(address?.country) || "Rwanda",
          notifications: {
            orderUpdates: booleanValue(profileData.notifyOrderUpdates, true),
            promotions: booleanValue(profileData.notifyPromotions, false),
            newArtworks: booleanValue(profileData.notifyNewArtworks, true),
            artistUpdates: booleanValue(profileData.notifyArtistUpdates, true),
          },
        });

        // Set user name for layout
        const firstName = stringValue(profileData.firstName);
        if (firstName) {
          setUserName(firstName);
        } else if (payload.user.name) {
          setUserName(payload.user.name.split(" ")[0]);
        }
      } catch (error) {
        if (isCurrent) {
          setStatusMessage(error instanceof Error ? error.message : t("dashboard.buyer.profile.loadError"));
        }
      }
    }

    loadProfile();

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (key: string) => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications],
      },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage("");

    try {
      await saveProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: {
          line1: profile.address,
          city: profile.city,
          country: profile.country,
        },
      });
      setSaveSuccess(true);
      // Refresh the navbar/header name (and avatar) live after a profile save.
      emitProfileUpdated();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t("dashboard.buyer.profile.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: t("dashboard.buyer.profile.tabProfile"), icon: User },
    { id: "security", label: t("dashboard.buyer.profile.tabSecurity"), icon: Shield },
  ];

  return (
    <DashboardLayout role="buyer" userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.buyer.profile.title")}</h1>
            <p className="text-gray-500">
              {t("dashboard.buyer.profile.subtitle")}
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("dashboard.buyer.profile.saving")}
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                {t("dashboard.buyer.profile.saved")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t("dashboard.buyer.profile.saveChanges")}
              </>
            )}
          </button>
        </div>

        {statusMessage && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {statusMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-teal-600 border-b-2 border-teal-600 bg-teal-50/50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Profile Photo */}
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 overflow-hidden bg-gradient-to-br from-teal-100 to-amber-100 rounded-full flex items-center justify-center">
                      {avatarPreview || avatarUrl ? (
                        <img src={avatarPreview ?? avatarUrl ?? ""} alt={t("dashboard.buyer.profile.profilePhotoAlt")} className="h-full w-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-teal-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors shadow-lg cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        aria-label={t("dashboard.buyer.profile.uploadPhotoAria")}
                        className="hidden"
                        onChange={(e) => {
                          const f = e.currentTarget.files?.[0];
                          if (!f) return;
                          setAvatarPreview(URL.createObjectURL(f));
                          uploadAvatar(f);
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {t("dashboard.buyer.profile.profilePhoto")}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {t("dashboard.buyer.profile.profilePhotoDesc")}
                    </p>
                    <label className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer">
                      {avatarUploading ? t("dashboard.buyer.profile.uploading") : t("dashboard.buyer.profile.uploadPhoto")}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        aria-label={t("dashboard.buyer.profile.uploadPhotoAria")}
                        className="hidden"
                        disabled={avatarUploading}
                        onChange={(e) => {
                          const f = e.currentTarget.files?.[0];
                          if (!f) return;
                          setAvatarPreview(URL.createObjectURL(f));
                          uploadAvatar(f);
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("dashboard.buyer.profile.personalInfo")}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.buyer.profile.firstName")}
                      </label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.buyer.profile.lastName")}
                      </label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail className="w-4 h-4 inline mr-1" />
                        {t("dashboard.buyer.profile.email")}
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        readOnly
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Phone className="w-4 h-4 inline mr-1" />
                        {t("dashboard.buyer.profile.phone")}
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {t("dashboard.buyer.profile.deliveryAddress")}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.buyer.profile.streetAddress")}
                      </label>
                      <input
                        type="text"
                        value={profile.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.buyer.profile.city")}
                      </label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.buyer.profile.country")}
                      </label>
                      <select
                        aria-label={t("dashboard.buyer.profile.country")}
                        value={profile.country}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      >
                        <option value="Rwanda">Rwanda</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Uganda">Uganda</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Burundi">Burundi</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-8">
                {/* Change Password */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("dashboard.buyer.profile.changePassword")}
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.buyer.profile.currentPassword")}
                      </label>
                      <input
                        id="currentPassword"
                        type="password"
                        value={pw.currentPassword}
                        onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.buyer.profile.newPassword")}
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={pw.newPassword}
                        onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        {t("dashboard.buyer.profile.confirmNewPassword")}
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={pw.confirmPassword}
                        onChange={(e) => setPw((p) => ({ ...p, confirmPassword: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    {pwMsg && (
                      <p className={`text-sm ${pwMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>{pwMsg.text}</p>
                    )}
                    <button
                      type="button"
                      onClick={updatePassword}
                      disabled={pwSaving || !pw.currentPassword || !pw.newPassword}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                    >
                      {pwSaving ? t("dashboard.buyer.profile.updating") : t("dashboard.buyer.profile.updatePassword")}
                    </button>
                  </div>
                </div>

                {/* Delete Account */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    {t("dashboard.buyer.profile.dangerZone")}
                  </h3>
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-red-900">
                          {t("dashboard.buyer.profile.deleteYourAccount")}
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          {t("dashboard.buyer.profile.deletePermanent")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t("dashboard.buyer.profile.deleteAccount")}
                      </button>
                    </div>
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
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
