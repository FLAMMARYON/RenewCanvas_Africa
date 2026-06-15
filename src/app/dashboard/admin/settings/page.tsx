"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  Database,
  Palette,
  DollarSign,
  Truck,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// Settings sections (labels resolved via t() inside the component)
const settingsSections = [
  { id: "general", labelKey: "tabGeneral", icon: Settings },
  { id: "email", labelKey: "tabEmail", icon: Mail },
  { id: "notifications", labelKey: "tabNotifications", icon: Bell },
  { id: "security", labelKey: "tabSecurity", icon: Shield },
  { id: "payments", labelKey: "tabPayments", icon: DollarSign },
  { id: "shipping", labelKey: "tabShipping", icon: Truck },
];

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "RenewCanvas Africa",
    siteUrl: "https://renewcanvas.africa",
    supportEmail: "hello.renewcanvas@gmail.com",
    timezone: "Africa/Kigali",
    currency: "USD",
    language: "en",
    maintenanceMode: false,
  });

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "hello.renewcanvas@gmail.com",
    smtpPassword: "••••••••••••",
    fromName: "RenewCanvas Africa",
    fromEmail: "hello.renewcanvas@gmail.com",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    newUserRegistration: true,
    newOrder: true,
    orderStatusChange: true,
    newArtistApplication: true,
    artistVerified: true,
    newArtwork: false,
    lowStock: true,
    paymentReceived: true,
    refundProcessed: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorRequired: false,
    sessionTimeout: "30",
    maxLoginAttempts: "5",
    passwordMinLength: "8",
    requireSpecialChar: true,
    requireNumber: true,
    requireUppercase: true,
  });

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    stripePublicKey: "pk_test_••••••••••••••••",
    stripeSecretKey: "sk_test_••••••••••••••••",
    mtnMomoEnabled: true,
    mtnMomoPromptEnabled: true,
    mtnMomoUssdEnabled: true,
    mtnMomoUssdCode: "*182*8*1#",
    mtnMomoMerchantCode: "123456",
    artistCommission: "80",
    platformFee: "20",
    minPayout: "5000",
    payoutHoldHours: "48",
  });

  // Shipping settings
  const [shippingSettings, setShippingSettings] = useState({
    domesticBaseRate: "5",
    internationalBaseRate: "25",
    freeShippingThreshold: "200",
    estimatedDomestic: "3-7",
    estimatedInternational: "14-28",
    enableTracking: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("admin.settings.pageTitle")}</h1>
            <p className="text-gray-500">
              {t("admin.settings.pageSubtitle")}
            </p>
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 p-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{t(`admin.settings.${section.labelKey}`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              {/* General Settings */}
              {activeSection === "general" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("admin.settings.generalTitle")}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {t("admin.settings.generalSubtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.siteNameLabel")}
                      </label>
                      <input
                        type="text"
                        value={generalSettings.siteName}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            siteName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.siteUrlLabel")}
                      </label>
                      <input
                        type="url"
                        value={generalSettings.siteUrl}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            siteUrl: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.supportEmailLabel")}
                      </label>
                      <input
                        type="email"
                        value={generalSettings.supportEmail}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            supportEmail: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.timezoneLabel")}
                      </label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            timezone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="Africa/Kigali">{t("admin.settings.tzKigali")}</option>
                        <option value="Africa/Nairobi">{t("admin.settings.tzNairobi")}</option>
                        <option value="Africa/Lagos">{t("admin.settings.tzLagos")}</option>
                        <option value="Africa/Cairo">{t("admin.settings.tzCairo")}</option>
                        <option value="UTC">{t("admin.settings.tzUtc")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.defaultCurrencyLabel")}
                      </label>
                      <select
                        value={generalSettings.currency}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            currency: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="USD">{t("admin.settings.currencyUsd")}</option>
                        <option value="EUR">{t("admin.settings.currencyEur")}</option>
                        <option value="RWF">{t("admin.settings.currencyRwf")}</option>
                        <option value="KES">{t("admin.settings.currencyKes")}</option>
                        <option value="NGN">{t("admin.settings.currencyNgn")}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.languageLabel")}
                      </label>
                      <select
                        value={generalSettings.language}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            language: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="sw">Swahili</option>
                      </select>
                    </div>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {t("admin.settings.maintenanceModeLabel")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t("admin.settings.maintenanceModeDesc")}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={generalSettings.maintenanceMode}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            maintenanceMode: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Email Settings */}
              {activeSection === "email" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("admin.settings.emailTitle")}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {t("admin.settings.emailSubtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.smtpHostLabel")}
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpHost}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            smtpHost: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.smtpPortLabel")}
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpPort}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            smtpPort: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.smtpUsernameLabel")}
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpUser}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            smtpUser: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.smtpPasswordLabel")}
                      </label>
                      <input
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            smtpPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.fromNameLabel")}
                      </label>
                      <input
                        type="text"
                        value={emailSettings.fromName}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            fromName: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.fromEmailLabel")}
                      </label>
                      <input
                        type="email"
                        value={emailSettings.fromEmail}
                        onChange={(e) =>
                          setEmailSettings({
                            ...emailSettings,
                            fromEmail: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <button className="mt-4 px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors">
                    {t("admin.settings.sendTestEmail")}
                  </button>
                </div>
              )}

              {/* Notification Settings */}
              {activeSection === "notifications" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("admin.settings.notificationsTitle")}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {t("admin.settings.notificationsSubtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "newUserRegistration",
                        labelKey: "notifNewUserRegistrationLabel",
                        descKey: "notifNewUserRegistrationDesc",
                      },
                      {
                        key: "newOrder",
                        labelKey: "notifNewOrderLabel",
                        descKey: "notifNewOrderDesc",
                      },
                      {
                        key: "orderStatusChange",
                        labelKey: "notifOrderStatusChangeLabel",
                        descKey: "notifOrderStatusChangeDesc",
                      },
                      {
                        key: "newArtistApplication",
                        labelKey: "notifNewArtistApplicationLabel",
                        descKey: "notifNewArtistApplicationDesc",
                      },
                      {
                        key: "artistVerified",
                        labelKey: "notifArtistVerifiedLabel",
                        descKey: "notifArtistVerifiedDesc",
                      },
                      {
                        key: "newArtwork",
                        labelKey: "notifNewArtworkLabel",
                        descKey: "notifNewArtworkDesc",
                      },
                      {
                        key: "paymentReceived",
                        labelKey: "notifPaymentReceivedLabel",
                        descKey: "notifPaymentReceivedDesc",
                      },
                      {
                        key: "refundProcessed",
                        labelKey: "notifRefundProcessedLabel",
                        descKey: "notifRefundProcessedDesc",
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{t(`admin.settings.${item.labelKey}`)}</p>
                          <p className="text-sm text-gray-500">{t(`admin.settings.${item.descKey}`)}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={
                            notificationSettings[
                              item.key as keyof typeof notificationSettings
                            ]
                          }
                          onChange={() =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [item.key]:
                                !notificationSettings[
                                  item.key as keyof typeof notificationSettings
                                ],
                            })
                          }
                          className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeSection === "security" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("admin.settings.securityTitle")}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {t("admin.settings.securitySubtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.sessionTimeoutLabel")}
                      </label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.maxLoginAttemptsLabel")}
                      </label>
                      <input
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            maxLoginAttempts: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.minPasswordLengthLabel")}
                      </label>
                      <input
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordMinLength: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <h3 className="font-medium text-gray-900">
                      {t("admin.settings.passwordRequirementsHeading")}
                    </h3>
                    {[
                      {
                        key: "twoFactorRequired",
                        labelKey: "secRequire2faLabel",
                      },
                      { key: "requireSpecialChar", labelKey: "secRequireSpecialCharLabel" },
                      { key: "requireNumber", labelKey: "secRequireNumberLabel" },
                      { key: "requireUppercase", labelKey: "secRequireUppercaseLabel" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            securitySettings[
                              item.key as keyof typeof securitySettings
                            ] as boolean
                          }
                          onChange={() =>
                            setSecuritySettings({
                              ...securitySettings,
                              [item.key]:
                                !securitySettings[
                                  item.key as keyof typeof securitySettings
                                ],
                            })
                          }
                          className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-gray-700">{t(`admin.settings.${item.labelKey}`)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeSection === "payments" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("admin.settings.paymentsTitle")}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {t("admin.settings.paymentsSubtitle")}
                      </p>
                    </div>
                  </div>

                  {/* Commission Settings */}
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">
                      {t("admin.settings.managedFlowHeading")}
                    </h3>
                    <p className="text-sm text-blue-700">
                      {t("admin.settings.managedFlowDesc")}
                    </p>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-4">
                      {t("admin.settings.commissionPayoutHeading")}
                    </h3>
                    <div className="grid sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("admin.settings.artistCommissionLabel")}
                        </label>
                        <input
                          type="number"
                          value={paymentSettings.artistCommission}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              artistCommission: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("admin.settings.platformFeeLabel")}
                        </label>
                        <input
                          type="number"
                          value={paymentSettings.platformFee}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              platformFee: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("admin.settings.minPayoutLabel")}
                        </label>
                        <input
                          type="number"
                          value={paymentSettings.minPayout}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              minPayout: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t("admin.settings.payoutHoldLabel")}
                        </label>
                        <input
                          type="number"
                          value={paymentSettings.payoutHoldHours}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              payoutHoldHours: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-teal-700 mt-3">
                      {t("admin.settings.artistPaymentPrivacyNote")}
                    </p>
                  </div>

                  {/* Stripe Settings */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="flex items-center justify-between mb-4 cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">{t("admin.settings.stripeLabel")}</p>
                        <p className="text-sm text-gray-500">
                          {t("admin.settings.stripeDesc")}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={paymentSettings.stripeEnabled}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            stripeEnabled: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </label>
                    {paymentSettings.stripeEnabled && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("admin.settings.publishableKeyLabel")}
                          </label>
                          <div className="relative">
                            <input
                              type={showApiKey ? "text" : "password"}
                              value={paymentSettings.stripePublicKey}
                              onChange={(e) =>
                                setPaymentSettings({
                                  ...paymentSettings,
                                  stripePublicKey: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowApiKey(!showApiKey)}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            >
                              {showApiKey ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("admin.settings.secretKeyLabel")}
                          </label>
                          <input
                            type="password"
                            value={paymentSettings.stripeSecretKey}
                            onChange={(e) =>
                              setPaymentSettings({
                                ...paymentSettings,
                                stripeSecretKey: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MTN MoMo Settings */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">{t("admin.settings.mtnMomoLabel")}</p>
                        <p className="text-sm text-gray-500">
                          {t("admin.settings.mtnMomoDesc")}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={paymentSettings.mtnMomoEnabled}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            mtnMomoEnabled: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </label>
                    {paymentSettings.mtnMomoEnabled && (
                      <div className="mt-4 grid sm:grid-cols-3 gap-4">
                        <label className="flex items-center justify-between gap-4 sm:col-span-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {t("admin.settings.phoneApprovalLabel")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t("admin.settings.phoneApprovalDesc")}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={paymentSettings.mtnMomoPromptEnabled}
                            onChange={(e) =>
                              setPaymentSettings({
                                ...paymentSettings,
                                mtnMomoPromptEnabled: e.target.checked,
                              })
                            }
                            className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                        </label>
                        <label className="flex items-center justify-between gap-4 sm:col-span-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {t("admin.settings.ussdFallbackLabel")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t("admin.settings.ussdFallbackDesc")}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={paymentSettings.mtnMomoUssdEnabled}
                            onChange={(e) =>
                              setPaymentSettings({
                                ...paymentSettings,
                                mtnMomoUssdEnabled: e.target.checked,
                              })
                            }
                            className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                        </label>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("admin.settings.ussdCodeLabel")}
                          </label>
                          <input
                            type="text"
                            value={paymentSettings.mtnMomoUssdCode}
                            onChange={(e) =>
                              setPaymentSettings({
                                ...paymentSettings,
                                mtnMomoUssdCode: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("admin.settings.merchantCodeLabel")}
                          </label>
                          <input
                            type="text"
                            value={paymentSettings.mtnMomoMerchantCode}
                            onChange={(e) =>
                              setPaymentSettings({
                                ...paymentSettings,
                                mtnMomoMerchantCode: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500 sm:col-span-3">
                          {t("admin.settings.momoReconcileNote")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping Settings */}
              {activeSection === "shipping" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {t("admin.settings.shippingTitle")}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {t("admin.settings.shippingSubtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.domesticBaseRateLabel")}
                      </label>
                      <input
                        type="number"
                        value={shippingSettings.domesticBaseRate}
                        onChange={(e) =>
                          setShippingSettings({
                            ...shippingSettings,
                            domesticBaseRate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.internationalBaseRateLabel")}
                      </label>
                      <input
                        type="number"
                        value={shippingSettings.internationalBaseRate}
                        onChange={(e) =>
                          setShippingSettings({
                            ...shippingSettings,
                            internationalBaseRate: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.freeShippingThresholdLabel")}
                      </label>
                      <input
                        type="number"
                        value={shippingSettings.freeShippingThreshold}
                        onChange={(e) =>
                          setShippingSettings({
                            ...shippingSettings,
                            freeShippingThreshold: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.domesticDeliveryLabel")}
                      </label>
                      <input
                        type="text"
                        value={shippingSettings.estimatedDomestic}
                        onChange={(e) =>
                          setShippingSettings({
                            ...shippingSettings,
                            estimatedDomestic: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("admin.settings.internationalDeliveryLabel")}
                      </label>
                      <input
                        type="text"
                        value={shippingSettings.estimatedInternational}
                        onChange={(e) =>
                          setShippingSettings({
                            ...shippingSettings,
                            estimatedInternational: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shippingSettings.enableTracking}
                      onChange={(e) =>
                        setShippingSettings({
                          ...shippingSettings,
                          enableTracking: e.target.checked,
                        })
                      }
                      className="w-5 h-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-gray-700">
                      {t("admin.settings.enableTrackingLabel")}
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
