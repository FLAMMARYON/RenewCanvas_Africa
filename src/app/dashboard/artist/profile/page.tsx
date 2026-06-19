"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Camera,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Users,
  Save,
  CheckCircle,
  AlertCircle,
  Upload,
  Plus,
  Award,
  Palette,
  Recycle,
  FileText,
  CreditCard,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { readProfile, saveProfile } from "@/lib/frontend/profile-api";
import { emitProfileUpdated } from "@/lib/frontend/profile-events";

const initialProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  bio: "",
  location: "",
  website: "",
  instagram: "",
  twitter: "",
  facebook: "",
  specialties: [] as string[],
  techniques: [] as string[],
  preferredMaterials: [] as string[],
  yearsExperience: 0,
  payoutMethod: "MTN Mobile Money",
  payoutAccountName: "",
  payoutAccountNumber: "",
  payoutBankName: "",
  isVerified: false,
  verificationStatus: "not_submitted",
  completionPercentage: 0,
};

const availableSpecialties = [
  "Sculpture",
  "Mixed Media",
  "Wall Art",
  "Jewelry",
  "Fashion",
  "Home Decor",
  "Functional Art",
  "Installation",
];

const availableTechniques = [
  "Weaving",
  "Assemblage",
  "Mosaic",
  "Collage",
  "Molding",
  "Carving",
  "Sewing",
  "Binding",
];

const availableMaterials = [
  "PET Bottles",
  "Fabric Scraps",
  "Metal Cans",
  "Bottle Caps",
  "Cardboard",
  "Glass",
  "Electronic Waste",
  "Plastic Bags",
  "Paper",
  "Rubber/Tires",
];

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function stringArrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function completionPercentage(profile: typeof initialProfile): number {
  const fields = [
    profile.firstName,
    profile.lastName,
    profile.phone,
    profile.bio,
    profile.location,
    profile.website,
    profile.specialties.length ? "specialties" : "",
    profile.techniques.length ? "techniques" : "",
    profile.preferredMaterials.length ? "materials" : "",
    profile.payoutMethod,
    profile.payoutAccountName,
    profile.payoutAccountNumber,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export default function ArtistProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<"profile" | "payout">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [userName, setUserName] = useState(t("artistDashboard.profile.defaultUserName"));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const uploadAvatar = async (file: File) => {
    setAvatarUploading(true);
    setStatusMessage("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/profile/avatar", { method: "POST", body: fd, credentials: "include" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.message || t("artistDashboard.profile.errUploadPhoto"));
      setAvatarUrl(body.avatarUrl);
      setStatusMessage(t("artistDashboard.profile.photoUpdated"));
      // Refresh the navbar/header avatar everywhere it shows.
      emitProfileUpdated();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : t("artistDashboard.profile.errUploadPhoto"));
    } finally {
      setAvatarUploading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile() {
      try {
        const payload = await readProfile();
        if (!isCurrent) return;
        const profileData = payload.profile;
        setAvatarUrl(typeof profileData.avatarUrl === "string" ? profileData.avatarUrl : null);
        const nextProfile = {
          firstName: stringValue(profileData.firstName),
          lastName: stringValue(profileData.lastName),
          email: payload.user.email,
          phone: stringValue(profileData.phone),
          bio: stringValue(profileData.bio),
          location: stringValue(profileData.location),
          website: stringValue(profileData.website),
          instagram: stringValue(profileData.instagram),
          twitter: stringValue(profileData.twitter),
          facebook: stringValue(profileData.facebook),
          specialties: stringArrayValue(profileData.specialties),
          techniques: stringArrayValue(profileData.techniques),
          preferredMaterials: stringArrayValue(profileData.preferredMaterials),
          yearsExperience: numberValue(profileData.yearsExperience),
          // MoMo-only now; ignore any legacy bank value stored before.
          payoutMethod: "MTN Mobile Money",
          payoutAccountName: stringValue(profileData.payoutAccountName),
          // Pre-fill the MoMo number from the saved payout number, else the
          // phone the artist provided at signup (persisted on the profile).
          payoutAccountNumber: stringValue(profileData.payoutAccountNumber) || stringValue(profileData.phone),
          payoutBankName: stringValue(profileData.payoutBankName),
          isVerified: stringValue(profileData.verificationStatus) === "approved",
          verificationStatus: stringValue(profileData.verificationStatus) || "not_submitted",
          completionPercentage: 0,
        };
        setProfile({
          ...nextProfile,
          completionPercentage: completionPercentage(nextProfile),
        });
        setUserName(nextProfile.firstName ? `${nextProfile.firstName} ${nextProfile.lastName}`.trim() : t("artistDashboard.profile.defaultUserName"));
      } catch (error) {
        if (isCurrent) {
          setStatusMessage(error instanceof Error ? error.message : t("artistDashboard.profile.errLoadProfile"));
        }
      }
    }

    loadProfile();

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: string, item: string) => {
    setProfile((prev) => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      if (currentArray.includes(item)) {
        return { ...prev, [field]: currentArray.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...currentArray, item] };
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage("");

    try {
      await saveProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        instagram: profile.instagram,
        twitter: profile.twitter,
        facebook: profile.facebook,
        specialties: profile.specialties,
        techniques: profile.techniques,
        preferredMaterials: profile.preferredMaterials,
        yearsExperience: profile.yearsExperience,
        // MoMo-only: always persist MTN Mobile Money and clear any legacy bank name.
        payoutMethod: "MTN Mobile Money",
        payoutAccountName: profile.payoutAccountName,
        payoutAccountNumber: profile.payoutAccountNumber,
        payoutBankName: "",
      });
      setProfile((current) => ({
        ...current,
        completionPercentage: completionPercentage(current),
      }));
      setSaveSuccess(true);
      // Refresh the navbar/header name (and avatar) live after a profile save.
      emitProfileUpdated();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : t("artistDashboard.profile.errSaveProfile"));
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: t("artistDashboard.profile.tabProfileInfo"), icon: User },
    { id: "payout", label: t("artistDashboard.profile.tabPayoutInfo"), icon: CreditCard },
  ];

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("artistDashboard.profile.title")}</h1>
            <p className="text-gray-500">
              {t("artistDashboard.profile.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Profile Completion */}
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-lg">
              <div className="w-8 h-8 relative">
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="#14b8a6"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${(profile.completionPercentage / 100) * 88} 88`}
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-teal-700">
                {t("artistDashboard.profile.percentComplete", { percent: profile.completionPercentage })}
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("artistDashboard.profile.saving")}
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {t("artistDashboard.profile.saved")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t("artistDashboard.profile.saveProfile")}
                </>
              )}
            </button>
          </div>
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
            {/* Profile Info Tab */}
            {activeTab === "profile" && (
              <div className="space-y-8">
                {/* Profile Photo */}
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 overflow-hidden bg-gradient-to-br from-teal-100 to-amber-100 rounded-full flex items-center justify-center">
                      {avatarPreview || avatarUrl ? (
                        <img src={avatarPreview ?? avatarUrl ?? ""} alt={t("artistDashboard.profile.profilePhotoAlt")} className="h-full w-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-teal-400" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors shadow-lg cursor-pointer">
                      <Camera className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp" aria-label={t("artistDashboard.profile.uploadPhotoAria")}
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
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">{t("artistDashboard.profile.profilePhoto")}</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {t("artistDashboard.profile.profilePhotoHint")}
                    </p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {avatarUploading ? t("artistDashboard.profile.uploading") : t("artistDashboard.profile.uploadPhoto")}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp" aria-label={t("artistDashboard.profile.uploadPhotoAria")}
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

                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("artistDashboard.profile.basicInformation")}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("artistDashboard.profile.firstName")}
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
                        {t("artistDashboard.profile.lastName")}
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
                        {t("artistDashboard.profile.email")}
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
                        {t("artistDashboard.profile.phoneNumber")}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {t("artistDashboard.profile.location")}
                      </label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("artistDashboard.profile.yearsOfExperience")}
                      </label>
                      <select
                        value={profile.yearsExperience}
                        onChange={(e) =>
                          handleInputChange(
                            "yearsExperience",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      >
                        <option value={0}>{t("artistDashboard.profile.expLessThan1")}</option>
                        <option value={1}>{t("artistDashboard.profile.exp1to2")}</option>
                        <option value={3}>{t("artistDashboard.profile.exp3to5")}</option>
                        <option value={5}>{t("artistDashboard.profile.exp5to10")}</option>
                        <option value={10}>{t("artistDashboard.profile.exp10plus")}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("artistDashboard.profile.bioLabel")}
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder={t("artistDashboard.profile.bioPlaceholder")}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("artistDashboard.profile.bioCharCount", { count: profile.bio.length })}
                  </p>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("artistDashboard.profile.socialWebLinks")}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Globe className="w-4 h-4 inline mr-1" />
                        {t("artistDashboard.profile.website")}
                      </label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                        placeholder={t("artistDashboard.profile.websitePlaceholder")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Camera className="w-4 h-4 inline mr-1" />
                        {t("artistDashboard.profile.instagram")}
                      </label>
                      <input
                        type="text"
                        value={profile.instagram}
                        onChange={(e) =>
                          handleInputChange("instagram", e.target.value)
                        }
                        placeholder={t("artistDashboard.profile.usernamePlaceholder")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MessageCircle className="w-4 h-4 inline mr-1" />
                        {t("artistDashboard.profile.twitter")}
                      </label>
                      <input
                        type="text"
                        value={profile.twitter}
                        onChange={(e) =>
                          handleInputChange("twitter", e.target.value)
                        }
                        placeholder={t("artistDashboard.profile.usernamePlaceholder")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Users className="w-4 h-4 inline mr-1" />
                        {t("artistDashboard.profile.facebook")}
                      </label>
                      <input
                        type="text"
                        value={profile.facebook}
                        onChange={(e) =>
                          handleInputChange("facebook", e.target.value)
                        }
                        placeholder={t("artistDashboard.profile.facebookPlaceholder")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("artistDashboard.profile.artSpecialties")}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t("artistDashboard.profile.artSpecialtiesHint")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableSpecialties.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => toggleArrayItem("specialties", specialty)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          profile.specialties.includes(specialty)
                            ? "bg-teal-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Techniques */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t("artistDashboard.profile.techniquesUsed")}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t("artistDashboard.profile.techniquesUsedHint")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableTechniques.map((technique) => (
                      <button
                        key={technique}
                        onClick={() => toggleArrayItem("techniques", technique)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          profile.techniques.includes(technique)
                            ? "bg-amber-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {technique}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Materials */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <Recycle className="w-4 h-4 inline mr-1" />
                    {t("artistDashboard.profile.preferredRecycledMaterials")}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t("artistDashboard.profile.preferredRecycledMaterialsHint")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableMaterials.map((material) => (
                      <button
                        key={material}
                        onClick={() =>
                          toggleArrayItem("preferredMaterials", material)
                        }
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          profile.preferredMaterials.includes(material)
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {material}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Payout Tab */}
            {activeTab === "payout" && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      {t("artistDashboard.profile.privatePayoutDetails")}
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      {t("artistDashboard.profile.privatePayoutDetailsHint")}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("artistDashboard.profile.payoutMethod")}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("artistDashboard.profile.preferredPayoutMethod")}
                      </label>
                      <select
                        value={profile.payoutMethod}
                        onChange={(e) =>
                          handleInputChange("payoutMethod", e.target.value)
                        }
                        aria-label={t("artistDashboard.profile.preferredPayoutMethod")}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      >
                        {/* MoMo-only — bank transfer removed entirely (item 8). */}
                        <option value="MTN Mobile Money">MTN Mobile Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("artistDashboard.profile.accountHolderName")}
                      </label>
                      <input
                        type="text"
                        value={profile.payoutAccountName}
                        onChange={(e) =>
                          handleInputChange("payoutAccountName", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("artistDashboard.profile.momoNumber", { defaultValue: "MTN MoMo number" })}
                      </label>
                      <input
                        type="tel"
                        value={profile.payoutAccountNumber}
                        onChange={(e) =>
                          handleInputChange("payoutAccountNumber", e.target.value)
                        }
                        placeholder="+250 7XX XXX XXX"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {t("artistDashboard.profile.momoNumberHint", { defaultValue: "Defaults to the phone number you used at signup." })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
                  <h3 className="font-semibold text-teal-900 mb-2">
                    {t("artistDashboard.profile.payoutReleaseRule")}
                  </h3>
                  <p className="text-sm text-teal-700">
                    {t("artistDashboard.profile.payoutReleaseRuleText")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
