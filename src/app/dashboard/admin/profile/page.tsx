"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { readProfile, saveProfile } from "@/lib/frontend/profile-api";
import { CheckCircle, Mail, Phone, Save, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";

const initialProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  title: "",
};

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile() {
      try {
        const payload = await readProfile();
        if (!isCurrent) return;
        setProfile({
          firstName: stringValue(payload.profile.firstName),
          lastName: stringValue(payload.profile.lastName),
          email: payload.user.email,
          phone: stringValue(payload.profile.phone),
          title: stringValue(payload.profile.title),
        });
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

  const handleInputChange = (field: keyof typeof initialProfile, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage("");

    try {
      await saveProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        title: profile.title,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName="RenewCanvas Admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
            <p className="text-gray-500">Manage internal operator identity and contact details.</p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </button>
        </div>

        {statusMessage && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {statusMessage}
          </div>
        )}

        <div className="rounded-xl border border-gray-100 bg-white p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
              <Shield className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Operator Details</h2>
              <p className="text-sm text-gray-500">These details identify admin actions internally.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(event) => handleInputChange("firstName", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(event) => handleInputChange("lastName", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <Mail className="mr-1 inline h-4 w-4" />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <Phone className="mr-1 inline h-4 w-4" />
                Phone
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(event) => handleInputChange("phone", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <User className="mr-1 inline h-4 w-4" />
                Role Title
              </label>
              <input
                type="text"
                value={profile.title}
                onChange={(event) => handleInputChange("title", event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
