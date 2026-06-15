"use client";

import {
  Recycle,
  ArrowRight,
  Leaf,
  X,
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  Gift,
  Info,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function BookCollectionPage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Collection Form */}
      <CollectionFormSection />

      {/* Materials We Accept */}
      <MaterialsSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}

/* ============================================
   HERO SECTION
   ============================================ */
function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-teal-50" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="collectionGrid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.5" fill="#f59e0b" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#collectionGrid)" />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-24 right-[10%] w-32 h-32 bg-amber-200 rounded-full opacity-50 hidden lg:block" />
      <div className="absolute bottom-10 left-[5%] w-24 h-24 bg-teal-200 rounded-full opacity-40 hidden lg:block" />
      <div className="absolute top-40 left-[15%] w-16 h-16 bg-amber-100 rounded-full opacity-60 hidden lg:block" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-6">
            <Truck className="w-4 h-4" />
            {t("bookCollection.heroBadge")}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            {t("bookCollection.heroTitlePrefix")} <span className="text-amber-500">{t("bookCollection.heroTitleHighlight")}</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("bookCollection.heroSubheading")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#collection-form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] hover:scale-105 shadow-lg shadow-amber-500/30"
            >
              {t("bookCollection.heroSchedulePickup")}
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#materials"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:border-teal-500 hover:text-teal-600 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)]"
            >
              <Package className="w-5 h-5" />
              {t("bookCollection.heroWhatWeAccept")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   HOW IT WORKS SECTION
   ============================================ */
function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = [
    {
      number: "01",
      title: t("bookCollection.step1Title"),
      description: t("bookCollection.step1Description"),
      icon: MessageSquare,
    },
    {
      number: "02",
      title: t("bookCollection.step2Title"),
      description: t("bookCollection.step2Description"),
      icon: Calendar,
    },
    {
      number: "03",
      title: t("bookCollection.step3Title"),
      description: t("bookCollection.step3Description"),
      icon: Truck,
    },
    {
      number: "04",
      title: t("bookCollection.step4Title"),
      description: t("bookCollection.step4Description"),
      icon: Gift,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("bookCollection.howItWorksTitlePrefix")} <span className="text-teal-600">{t("bookCollection.howItWorksTitleHighlight")}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("bookCollection.howItWorksSubheading")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-gray-50 rounded-xl p-6 hover:shadow-lg [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1"
            >
              {/* Step Number */}
              <div className="text-5xl font-bold text-teal-100 absolute top-4 right-4">
                {step.number}
              </div>

              <div className="relative">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-teal-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   COLLECTION FORM SECTION
   ============================================ */
function CollectionFormSection() {
  const { t } = useTranslation();
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const materials = [
    { id: "plastic", label: t("bookCollection.materialPlastic"), icon: "🧴" },
    { id: "cardboard", label: t("bookCollection.materialCardboard"), icon: "📦" },
    { id: "fabric", label: t("bookCollection.materialFabric"), icon: "🧵" },
    { id: "metal", label: t("bookCollection.materialMetal"), icon: "🔩" },
    { id: "glass", label: t("bookCollection.materialGlass"), icon: "🫙" },
    { id: "electronics", label: t("bookCollection.materialElectronics"), icon: "📱" },
  ];

  const toggleMaterial = (id: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (selectedMaterials.length === 0) {
      setStatus({ type: "error", message: t("bookCollection.errorNoMaterials") });
      return;
    }

    const form = event.currentTarget;
    const fd = new FormData(form);
    const get = (k: string) => String(fd.get(k) ?? "").trim();

    const name = get("fullName");
    const email = get("email");
    const phone = get("phone");
    const selectedLabels = materials
      .filter((m) => selectedMaterials.includes(m.id))
      .map((m) => m.label);

    // Compose a human-readable message; full structured detail goes in metadata.
    const message = [
      `Collection request from ${name}.`,
      `Materials: ${selectedLabels.join(", ")}.`,
      `Pickup: ${get("address")}, ${get("district")}, ${get("city")}.`,
      `Preferred: ${get("preferredDate")} (${get("preferredTime")}).`,
      get("notes") ? `Notes: ${get("notes")}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking_request",
          name,
          email,
          phone,
          subject: `Collection Booking — ${get("city") || "Rwanda"}`,
          message,
          metadata: {
            organizationType: get("organizationType"),
            materials: selectedLabels,
            address: get("address"),
            district: get("district"),
            city: get("city"),
            landmark: get("landmark"),
            quantity: get("quantity"),
            preferredDate: get("preferredDate"),
            preferredTime: get("preferredTime"),
          },
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.error ?? t("bookCollection.errorSubmitFailed"));
      }
      setStatus({
        type: "success",
        message: t("bookCollection.successMessage"),
      });
      form.reset();
      setSelectedMaterials([]);
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : t("bookCollection.errorGeneric"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-400 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]";

  return (
    <section id="collection-form" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            <Truck className="w-4 h-4" />
            {t("bookCollection.formBadge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("bookCollection.formTitlePrefix")} <span className="text-amber-500">{t("bookCollection.formTitleHighlight")}</span>
          </h2>
          <p className="text-gray-600 text-lg">
            {t("bookCollection.formSubheading")}
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                {t("bookCollection.personalInfoHeading")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("bookCollection.fullNameLabel")}
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder={t("bookCollection.fullNamePlaceholder")}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("bookCollection.emailLabel")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    className={inputClasses}
                    required
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("bookCollection.phoneLabel")}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+250 XXX XXX XXX"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("bookCollection.organizationTypeLabel")}
                  </label>
                  <select id="organizationType" name="organizationType" className={inputClasses}>
                    <option value="individual">{t("bookCollection.orgIndividual")}</option>
                    <option value="business">{t("bookCollection.orgBusiness")}</option>
                    <option value="school">{t("bookCollection.orgSchool")}</option>
                    <option value="organization">{t("bookCollection.orgOrganization")}</option>
                    <option value="recycler">{t("bookCollection.orgRecycler")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                {t("bookCollection.pickupLocationHeading")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("bookCollection.addressLabel")}
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder={t("bookCollection.addressPlaceholder")}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("bookCollection.districtLabel")}
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    placeholder={t("bookCollection.districtPlaceholder")}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("bookCollection.cityLabel")}
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder={t("bookCollection.cityPlaceholder")}
                    className={inputClasses}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("bookCollection.landmarkLabel")}
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  placeholder={t("bookCollection.landmarkPlaceholder")}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Materials Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                {t("bookCollection.materialsToCollectHeading")}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {t("bookCollection.materialsHelperText")}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {materials.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => toggleMaterial(material.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)] ${
                      selectedMaterials.includes(material.id)
                        ? "border-amber-500 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <span className="text-2xl">{material.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{material.label}</span>
                    {selectedMaterials.includes(material.id) && (
                      <CheckCircle className="w-5 h-5 text-amber-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                {t("bookCollection.quantityLabel")}
              </label>
              <select id="quantity" name="quantity" className={inputClasses}>
                <option value="small">{t("bookCollection.quantitySmall")}</option>
                <option value="medium">{t("bookCollection.quantityMedium")}</option>
                <option value="large">{t("bookCollection.quantityLarge")}</option>
                <option value="bulk">{t("bookCollection.quantityBulk")}</option>
              </select>
            </div>

            {/* Preferred Schedule */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                {t("bookCollection.preferredScheduleHeading")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("bookCollection.preferredDateLabel")}
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("bookCollection.preferredTimeLabel")}
                  </label>
                  <select id="preferredTime" name="preferredTime" className={inputClasses} required>
                    <option value="">{t("bookCollection.timeSlotPlaceholder")}</option>
                    <option value="morning">{t("bookCollection.timeSlotMorning")}</option>
                    <option value="afternoon">{t("bookCollection.timeSlotAfternoon")}</option>
                    <option value="evening">{t("bookCollection.timeSlotEvening")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                {t("bookCollection.notesLabel")}
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder={t("bookCollection.notesPlaceholder")}
                className={`${inputClasses} resize-none`}
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-teal-700">
                  <p className="font-medium mb-1">{t("bookCollection.infoBoxTitle")}</p>
                  <p>
                    {t("bookCollection.infoBoxText")}
                  </p>
                </div>
              </div>
            </div>

            {/* Status banner (success / error) */}
            {status && (
              <div
                role="status"
                aria-live="polite"
                className={`p-4 rounded-xl border text-sm ${
                  status.type === "success"
                    ? "bg-teal-50 border-teal-200 text-teal-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {status.message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.02] shadow-lg shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Truck className="w-5 h-5" />
              {isSubmitting ? t("bookCollection.submitButtonSubmitting") : t("bookCollection.submitButton")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   MATERIALS SECTION
   ============================================ */
function MaterialsSection() {
  const { t } = useTranslation();
  const acceptedMaterials = [
    {
      category: t("bookCollection.acceptedPlasticsCategory"),
      items: [
        t("bookCollection.acceptedPlasticsItem1"),
        t("bookCollection.acceptedPlasticsItem2"),
        t("bookCollection.acceptedPlasticsItem3"),
        t("bookCollection.acceptedPlasticsItem4"),
      ],
      color: "teal",
    },
    {
      category: t("bookCollection.acceptedPaperCategory"),
      items: [
        t("bookCollection.acceptedPaperItem1"),
        t("bookCollection.acceptedPaperItem2"),
        t("bookCollection.acceptedPaperItem3"),
        t("bookCollection.acceptedPaperItem4"),
      ],
      color: "amber",
    },
    {
      category: t("bookCollection.acceptedTextilesCategory"),
      items: [
        t("bookCollection.acceptedTextilesItem1"),
        t("bookCollection.acceptedTextilesItem2"),
        t("bookCollection.acceptedTextilesItem3"),
        t("bookCollection.acceptedTextilesItem4"),
      ],
      color: "purple",
    },
    {
      category: t("bookCollection.acceptedMetalsCategory"),
      items: [
        t("bookCollection.acceptedMetalsItem1"),
        t("bookCollection.acceptedMetalsItem2"),
        t("bookCollection.acceptedMetalsItem3"),
        t("bookCollection.acceptedMetalsItem4"),
      ],
      color: "gray",
    },
  ];

  const notAccepted = [
    t("bookCollection.notAccepted1"),
    t("bookCollection.notAccepted2"),
    t("bookCollection.notAccepted3"),
    t("bookCollection.notAccepted4"),
    t("bookCollection.notAccepted5"),
    t("bookCollection.notAccepted6"),
  ];

  const colorClasses: Record<string, { bg: string; border: string; badge: string }> = {
    teal: { bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-100 text-teal-700" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
    purple: { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-100 text-purple-700" },
    gray: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-700" },
  };

  return (
    <section id="materials" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("bookCollection.acceptTitlePrefix")} <span className="text-teal-600">{t("bookCollection.acceptTitleHighlight")}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t("bookCollection.acceptSubheading")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {acceptedMaterials.map((material, index) => {
            const colors = colorClasses[material.color];
            return (
              <div
                key={index}
                className={`${colors.bg} border ${colors.border} rounded-xl p-6 hover:shadow-lg [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]`}
              >
                <span className={`inline-block px-3 py-1 ${colors.badge} rounded-full text-sm font-medium mb-4`}>
                  {material.category}
                </span>
                <ul className="space-y-2">
                  {material.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Not Accepted */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">{t("bookCollection.notAcceptedHeading")}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {notAccepted.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-red-600 text-sm">
                <X className="w-4 h-4 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   BENEFITS SECTION
   ============================================ */
function BenefitsSection() {
  const { t } = useTranslation();
  const benefits = [
    {
      icon: Gift,
      title: t("bookCollection.benefit1Title"),
      description: t("bookCollection.benefit1Description"),
    },
    {
      icon: Recycle,
      title: t("bookCollection.benefit2Title"),
      description: t("bookCollection.benefit2Description"),
    },
    {
      icon: Truck,
      title: t("bookCollection.benefit3Title"),
      description: t("bookCollection.benefit3Description"),
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-teal-600 to-teal-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t("bookCollection.benefitsTitle")}
          </h2>
          <p className="text-teal-100 max-w-2xl mx-auto">
            {t("bookCollection.benefitsSubheading")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]"
            >
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
              <p className="text-teal-100">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

