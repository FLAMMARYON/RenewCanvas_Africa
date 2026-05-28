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
import { readProfile, saveProfile } from "@/lib/frontend/profile-api";

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
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<"profile" | "portfolio" | "verification" | "payout">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [userName, setUserName] = useState("Artist");

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile() {
      try {
        const payload = await readProfile();
        if (!isCurrent) return;
        const profileData = payload.profile;
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
          payoutMethod: stringValue(profileData.payoutMethod) || "MTN Mobile Money",
          payoutAccountName: stringValue(profileData.payoutAccountName),
          payoutAccountNumber: stringValue(profileData.payoutAccountNumber),
          payoutBankName: stringValue(profileData.payoutBankName),
          isVerified: stringValue(profileData.verificationStatus) === "approved",
          verificationStatus: stringValue(profileData.verificationStatus) || "not_submitted",
          completionPercentage: 0,
        };
        setProfile({
          ...nextProfile,
          completionPercentage: completionPercentage(nextProfile),
        });
        setUserName(nextProfile.firstName ? `${nextProfile.firstName} ${nextProfile.lastName}`.trim() : "Artist");
      } catch (error) {
        if (isCurrent) {
          setStatusMessage(error instanceof Error ? error.message : "Could not load profile.");
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
        payoutMethod: profile.payoutMethod,
        payoutAccountName: profile.payoutAccountName,
        payoutAccountNumber: profile.payoutAccountNumber,
        payoutBankName: profile.payoutBankName,
      });
      setProfile((current) => ({
        ...current,
        completionPercentage: completionPercentage(current),
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "portfolio", label: "Portfolio", icon: Palette },
    { id: "verification", label: "Verification", icon: Award },
    { id: "payout", label: "Payout Info", icon: CreditCard },
  ];

  return (
    <DashboardLayout role="artist" userName={userName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Artist Profile</h1>
            <p className="text-gray-500">
              Complete your profile to attract more buyers
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
                {profile.completionPercentage}% Complete
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
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
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
                    <div className="w-32 h-32 bg-gradient-to-br from-teal-100 to-amber-100 rounded-full flex items-center justify-center">
                      <User className="w-16 h-16 text-teal-400" />
                    </div>
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition-colors shadow-lg">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Profile Photo
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a professional photo. This helps build trust with
                      buyers.
                    </p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
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
                        Last Name
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
                        Email
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
                        Phone Number
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
                        Location
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
                        Years of Experience
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
                        <option value={0}>Less than 1 year</option>
                        <option value={1}>1-2 years</option>
                        <option value={3}>3-5 years</option>
                        <option value={5}>5-10 years</option>
                        <option value={10}>10+ years</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio / Artist Statement
                  </label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder="Tell buyers about yourself, your artistic journey, and what inspires your work..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.bio.length}/500 characters
                  </p>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Social & Web Links
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Website
                      </label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                        placeholder="www.yoursite.com"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Camera className="w-4 h-4 inline mr-1" />
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={profile.instagram}
                        onChange={(e) =>
                          handleInputChange("instagram", e.target.value)
                        }
                        placeholder="@username"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MessageCircle className="w-4 h-4 inline mr-1" />
                        Twitter / X
                      </label>
                      <input
                        type="text"
                        value={profile.twitter}
                        onChange={(e) =>
                          handleInputChange("twitter", e.target.value)
                        }
                        placeholder="@username"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Users className="w-4 h-4 inline mr-1" />
                        Facebook
                      </label>
                      <input
                        type="text"
                        value={profile.facebook}
                        onChange={(e) =>
                          handleInputChange("facebook", e.target.value)
                        }
                        placeholder="facebook.com/username"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Art Specialties
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Select the types of art you create
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
                    Techniques Used
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Select the techniques you use in your work
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
                    Preferred Recycled Materials
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Select the materials you typically work with
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

            {/* Portfolio Tab */}
            {activeTab === "portfolio" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Portfolio Images
                    </h3>
                    <p className="text-sm text-gray-500">
                      Showcase your best work to attract buyers
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Images
                  </button>
                </div>

                {/* Portfolio Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* TODO: Replace this empty state with portfolio images when an existing portfolio API route is available. */}
                  <div className="col-span-full rounded-lg border border-dashed border-gray-200 p-8 text-center">
                    <Palette className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      Portfolio image data is not available from the existing API routes.
                    </p>
                  </div>

                  {/* Add New */}
                  <button className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-teal-500 hover:text-teal-500 transition-colors">
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm">Add Image</span>
                  </button>
                    </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> Upload high-quality images that show your
                    artistic range. Include close-ups of details and materials used.
                  </p>
                </div>
              </div>
            )}

            {/* Verification Tab */}
            {activeTab === "verification" && (
              <div className="space-y-6">
                {/* Verification Status */}
                <div
                  className={`p-6 rounded-xl border ${
                    profile.isVerified
                      ? "bg-green-50 border-green-200"
                      : profile.verificationStatus === "pending"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        profile.isVerified
                          ? "bg-green-100"
                          : profile.verificationStatus === "pending"
                          ? "bg-amber-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {profile.isVerified ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : profile.verificationStatus === "pending" ? (
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                      ) : (
                        <Award className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold ${
                          profile.isVerified
                            ? "text-green-900"
                            : profile.verificationStatus === "pending"
                            ? "text-amber-900"
                            : "text-gray-900"
                        }`}
                      >
                        {profile.isVerified
                          ? "Verified Artist"
                          : profile.verificationStatus === "pending"
                          ? "Verification Pending"
                          : "Not Verified"}
                      </h3>
                      <p
                        className={`text-sm ${
                          profile.isVerified
                            ? "text-green-700"
                            : profile.verificationStatus === "pending"
                            ? "text-amber-700"
                            : "text-gray-600"
                        }`}
                      >
                        {profile.isVerified
                          ? "Your profile has been verified. You have a verification badge on your listings."
                          : profile.verificationStatus === "pending"
                          ? "Your verification is being reviewed. This usually takes 2-3 business days."
                          : "Get verified to build trust with buyers and increase your sales."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Benefits */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Benefits of Verification
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-lg">
                      <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Trust Badge
                        </h4>
                        <p className="text-sm text-gray-500">
                          Display a verification badge on all your listings
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-lg">
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Higher Sales
                        </h4>
                        <p className="text-sm text-gray-500">
                          Verified artists see 40% more buyer engagement
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-lg">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Palette className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Featured Placement
                        </h4>
                        <p className="text-sm text-gray-500">
                          Priority placement in marketplace search results
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-lg">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Recycle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Impact Reports
                        </h4>
                        <p className="text-sm text-gray-500">
                          Access detailed environmental impact analytics
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Requirements */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Verification Requirements
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-lg">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          profile.completionPercentage >= 80
                            ? "bg-green-100"
                            : "bg-gray-100"
                        }`}
                      >
                        {profile.completionPercentage >= 80 ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-3 h-3 bg-gray-300 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Complete your profile (80%+)
                        </p>
                        <p className="text-sm text-gray-500">
                          Current: {profile.completionPercentage}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Upload government-issued ID
                        </p>
                        <p className="text-sm text-gray-500">Uploaded</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <div className="w-3 h-3 bg-gray-300 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Submit at least 3 artworks
                        </p>
                        <p className="text-sm text-gray-500">
                          You have submitted 2 artworks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <div className="w-3 h-3 bg-gray-300 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          Provide proof of using recycled materials
                        </p>
                        <p className="text-sm text-gray-500">Not submitted</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Upload Documents
                  </h3>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="font-medium text-gray-900 mb-1">
                      Upload verification documents
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      PDF, JPG, or PNG up to 10MB
                    </p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      Choose Files
                    </button>
                  </div>
                </div>

                {!profile.isVerified && profile.verificationStatus !== "pending" && (
                  <button className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
                    Submit for Verification
                  </button>
                )}
              </div>
            )}

            {/* Payout Tab */}
            {activeTab === "payout" && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Private artist payout details
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      This information is visible only to you and authorized
                      RenewCanvas admins. Buyers never see artist payment
                      details, and artists do not receive buyer contact details.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Payout Method
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Payout Method
                      </label>
                      <select
                        value={profile.payoutMethod}
                        onChange={(e) =>
                          handleInputChange("payoutMethod", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      >
                        <option value="MTN Mobile Money">MTN Mobile Money</option>
                        <option value="Airtel Money">Airtel Money</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Holder Name
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
                        Mobile Number or Account Number
                      </label>
                      <input
                        type="text"
                        value={profile.payoutAccountNumber}
                        onChange={(e) =>
                          handleInputChange("payoutAccountNumber", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name{" "}
                        <span className="text-gray-400">(if bank transfer)</span>
                      </label>
                      <input
                        type="text"
                        value={profile.payoutBankName}
                        onChange={(e) =>
                          handleInputChange("payoutBankName", e.target.value)
                        }
                        placeholder="Bank of Kigali, Equity Bank, etc."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
                  <h3 className="font-semibold text-teal-900 mb-2">
                    Payout Release Rule
                  </h3>
                  <p className="text-sm text-teal-700">
                    Buyers pay RenewCanvas Africa directly. RenewCanvas holds
                    your payout until 48 hours after delivery. If no eligible
                    return request is opened during that window, admins release
                    your payout to the method saved here.
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
