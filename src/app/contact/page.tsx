"use client";

import {
  Recycle,
  ArrowRight,
  Leaf,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  Building,
  ExternalLink,
  Briefcase,
  Image,
  FileText,
  Globe,
  Truck,
  ChevronDown,
} from "lucide-react";

// LinkedIn icon as inline SVG since lucide-react doesn't have it
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function ContactPage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Contact Info Cards */}
      <ContactInfoSection />

      {/* Book Collection CTA */}
      <BookCollectionCTA />

      {/* Contact Form Section */}
      <ContactFormSection />

      {/* FAQ Section */}
      <FAQSection />

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
      {/* Background - Light gradient matching RenewCanvas branding */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="contactGrid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="0.5" fill="#0d9488" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#contactGrid)" />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-24 right-[10%] w-32 h-32 bg-teal-200 rounded-full opacity-50 hidden lg:block" />
      <div className="absolute bottom-10 left-[5%] w-24 h-24 bg-amber-200 rounded-full opacity-40 hidden lg:block" />
      <div className="absolute top-40 left-[15%] w-16 h-16 bg-teal-100 rounded-full opacity-60 hidden lg:block" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
            <Mail className="w-4 h-4" />
            {t("contact.heroBadge")}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            {t("contact.heroHeadingPrefix")} <span className="text-teal-600">{t("contact.heroHeadingHighlight")}</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("contact.heroSubheading")}
          </p>

          <div className="group flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white border-2 border-teal-600 rounded-xl font-medium group-hover:bg-white group-hover:text-teal-600 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105 shadow-lg shadow-teal-600/30"
            >
              {t("contact.heroSendMessage")}
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/book-collection"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white border-2 border-amber-500 rounded-xl font-medium group-hover:bg-white group-hover:text-amber-500 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105 shadow-lg shadow-amber-500/30"
            >
              <Truck className="w-5 h-5" />
              {t("contact.heroBookCollection")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CONTACT INFO SECTION
   ============================================ */
function ContactInfoSection() {
  const { t } = useTranslation();
  const contactInfo = [
    {
      icon: Mail,
      title: t("contact.infoEmailTitle"),
      details: ["hello.renewcanvas@gmail.com"],
      color: "teal",
      href: "mailto:hello.renewcanvas@gmail.com",
    },
    {
      icon: Phone,
      title: t("contact.infoCallTitle"),
      details: ["+250 798 654 776"],
      subtext: t("contact.infoCallSubtext"),
      color: "purple",
      href: "tel:+250798654776",
    },
    {
      icon: MapPin,
      title: t("contact.infoVisitTitle"),
      details: ["Kigali, Rwanda"],
      subtext: t("contact.infoVisitSubtext"),
      color: "amber",
      href: "https://maps.google.com/?q=Kigali,Rwanda",
    },
    {
      icon: LinkedInIcon,
      title: t("contact.infoLinkedInTitle"),
      details: ["RenewCanvas Africa"],
      subtext: t("contact.infoLinkedInSubtext"),
      color: "blue",
      href: "https://www.linkedin.com/company/renewcanvas-africa/",
    },
  ];

  const colorClasses: Record<string, { bg: string; iconBg: string; icon: string; border: string }> = {
    teal: { bg: "bg-teal-50", iconBg: "bg-teal-100", icon: "text-teal-600", border: "border-teal-200" },
    purple: { bg: "bg-purple-50", iconBg: "bg-purple-100", icon: "text-purple-600", border: "border-purple-200" },
    amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", icon: "text-amber-600", border: "border-amber-200" },
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", icon: "text-blue-600", border: "border-blue-200" },
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => {
            const colors = colorClasses[info.color];
            return (
              <a
                key={index}
                href={info.href}
                target={info.href.startsWith("http") ? "_blank" : undefined}
                rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`${colors.bg} border ${colors.border} rounded-xl p-6 text-center hover:shadow-lg [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 block`}
              >
                <div className={`w-16 h-16 ${colors.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <info.icon className={`w-8 h-8 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-gray-700 font-medium text-sm break-all">
                    {detail}
                  </p>
                ))}
                {info.subtext && (
                  <p className="text-sm text-gray-500 mt-2">{info.subtext}</p>
                )}
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}

/* ============================================
   BOOK COLLECTION CTA
   ============================================ */
function BookCollectionCTA() {
  const { t } = useTranslation();
  return (
    <section className="py-16 bg-amber-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
              <Recycle className="w-4 h-4" />
              {t("contact.ctaBadge")}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t("contact.ctaHeading")}
            </h2>
            <p className="text-white/90 text-lg max-w-xl">
              {t("contact.ctaDescription")}
            </p>
          </div>

          <div className="group flex flex-col sm:flex-row gap-4">
            <a
              href="/book-collection"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-amber-500 border-2 border-white rounded-xl font-bold group-hover:bg-amber-500 group-hover:text-white group-hover:border-white [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105 shadow-lg"
            >
              <Truck className="w-5 h-5" />
              {t("contact.ctaBookCollection")}
            </a>
            <a
              href="/how-it-works#collection"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 text-white border-2 border-teal-600 rounded-xl font-medium group-hover:bg-white group-hover:text-teal-600 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
            >
              {t("contact.ctaLearnMore")}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CONTACT FORM SECTION
   ============================================ */
function ContactFormSection() {
  const { t } = useTranslation();
  const [selectedInquiry, setSelectedInquiry] = useState("general");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    location: "",
    portfolio: "",
    artStyle: "",
    experience: "",
    organization: "",
    website: "",
    partnershipType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Validate required fields
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus({
        type: "error",
        message: t("contact.errorRequiredFields"),
      });
      setIsSubmitting(false);
      return;
    }

    // Map inquiry type to API type
    const typeMap: Record<string, string> = {
      general: "contact_form",
      partnership: "partnership_inquiry",
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeMap[selectedInquiry],
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          subject: formData.subject || undefined,
          message: formData.message,
          metadata:
            selectedInquiry === "partnership"
              ? {
                  organization: formData.organization,
                  website: formData.website,
                  partnershipType: formData.partnershipType,
                }
              : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message || t("contact.successMessage"),
        });
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          location: "",
          portfolio: "",
          artStyle: "",
          experience: "",
          organization: "",
          website: "",
          partnershipType: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || t("contact.errorSendFailed"),
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: t("contact.errorNetwork"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inquiryTypes = [
    { icon: Users, label: t("contact.inquiryGeneral"), value: "general", color: "teal" },
    { icon: Building, label: t("contact.inquiryPartnership"), value: "partnership", color: "amber" },
  ];

  const inquiryColorClasses: Record<string, { selectedBg: string; icon: string; border: string }> = {
    teal: { selectedBg: "bg-teal-100", icon: "text-teal-600", border: "border-teal-500" },
    purple: { selectedBg: "bg-purple-100", icon: "text-purple-600", border: "border-purple-500" },
    amber: { selectedBg: "bg-amber-100", icon: "text-amber-600", border: "border-amber-500" },
  };

  const inputClasses = "w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)]";

  return (
    <section id="contact-form" className="py-16 bg-gray-50 relative">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle, #14b8a6 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("contact.formHeadingPrefix")} <span className="text-teal-600">{t("contact.formHeadingHighlight")}</span>
          </h2>
          <p className="text-gray-600 text-lg">
            {t("contact.formSubheading")}
          </p>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-xl">
          {/* Status Message */}
          {submitStatus && (
            <div
              className={`mb-6 p-4 rounded-xl ${
                submitStatus.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inquiry Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t("contact.inquiryLabel")}
              </label>
              <div className="grid sm:grid-cols-3 gap-3">
                {inquiryTypes.map((type) => {
                  const colors = inquiryColorClasses[type.color];
                  const isSelected = selectedInquiry === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSelectedInquiry(type.value)}
                      className={`relative flex items-center gap-3 p-4 bg-white border-2 rounded-xl cursor-pointer [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)] ${
                        isSelected ? colors.border : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)] ${
                        isSelected ? colors.selectedBg : "bg-gray-100"
                      }`}>
                        <type.icon className={`w-5 h-5 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)] ${
                          isSelected ? colors.icon : "text-gray-600"
                        }`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {type.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ===== GENERAL INQUIRY FORM ===== */}
            {selectedInquiry === "general" && (
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contact.fieldYourName")} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder={t("contact.placeholderFullName")} required className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contact.fieldEmailAddress")} <span className="text-red-500">*</span>
                    </label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t("contact.placeholderEmail")} required className={inputClasses} />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.fieldSubject")}
                  </label>
                  <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} placeholder={t("contact.placeholderSubject")} className={inputClasses} />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.fieldMessage")} <span className="text-red-500">*</span>
                  </label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={5} placeholder={t("contact.placeholderMessage")} required className={`${inputClasses} resize-none`} />
                </div>
              </div>
            )}

            {/* ===== PARTNERSHIP FORM ===== */}
            {selectedInquiry === "partnership" && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700">
                    <Building className="w-4 h-4 inline mr-2" />
                    {t("contact.partnershipNotice")}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contact.fieldContactPerson")} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder={t("contact.placeholderFullName")} required className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contact.fieldBusinessEmail")} <span className="text-red-500">*</span>
                    </label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t("contact.placeholderBusinessEmail")} required className={inputClasses} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      {t("contact.fieldOrganization")}
                    </label>
                    <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleInputChange} placeholder={t("contact.placeholderCompanyName")} className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      {t("contact.fieldWebsite")}
                    </label>
                    <input type="url" id="website" name="website" value={formData.website} onChange={handleInputChange} placeholder={t("contact.placeholderWebsite")} className={inputClasses} />
                  </div>
                </div>

                <div>
                  <label htmlFor="partnershipType" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contact.fieldPartnershipType")}
                  </label>
                  <select id="partnershipType" name="partnershipType" value={formData.partnershipType} onChange={handleInputChange} className={inputClasses}>
                    <option value="">{t("contact.partnershipTypeSelect")}</option>
                    <option value="sponsor">{t("contact.partnershipTypeSponsor")}</option>
                    <option value="material">{t("contact.partnershipTypeMaterial")}</option>
                    <option value="corporate">{t("contact.partnershipTypeCorporate")}</option>
                    <option value="event">{t("contact.partnershipTypeEvent")}</option>
                    <option value="media">{t("contact.partnershipTypeMedia")}</option>
                    <option value="ngo">{t("contact.partnershipTypeNgo")}</option>
                    <option value="other">{t("contact.partnershipTypeOther")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    {t("contact.fieldPartnershipProposal")} <span className="text-red-500">*</span>
                  </label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={5} placeholder={t("contact.placeholderPartnershipProposal")} required className={`${inputClasses} resize-none`} />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-white rounded-xl [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                selectedInquiry === "general"
                  ? "bg-teal-600 hover:bg-teal-700 shadow-teal-600/30"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("contact.buttonSending")}
                </>
              ) : (
                <>
                  {selectedInquiry === "partnership" ? t("contact.buttonSubmitProposal") : t("contact.buttonSendMessage")}
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FAQ SECTION
   ============================================ */
function FAQSection() {
  const { t } = useTranslation();
  const faqs = [
    {
      question: t("contact.faq1Question"),
      answer: t("contact.faq1Answer"),
    },
    {
      question: t("contact.faq2Question"),
      answer: t("contact.faq2Answer"),
    },
    {
      question: t("contact.faq3Question"),
      answer: t("contact.faq3Answer"),
    },
    {
      question: t("contact.faq4Question"),
      answer: t("contact.faq4Answer"),
    },
    {
      question: t("contact.faq5Question"),
      answer: t("contact.faq5Answer"),
    },
  ];

  return (
    <section id="faq" className="py-16 bg-white scroll-mt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            <span>{t("contact.faqBadge")}</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("contact.faqHeadingPrefix")} <span className="text-amber-500">{t("contact.faqHeadingHighlight")}</span>
          </h2>
          <p className="text-gray-600">
            {t("contact.faqSubheading")}
          </p>
        </div>

        {/* Native <details> accordion: keyboard-accessible and focusable by default. */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-amber-50 rounded-xl border-l-4 border-amber-400 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)] open:shadow-lg"
            >
              <summary className="flex items-start gap-3 cursor-pointer list-none p-6 text-lg font-semibold text-gray-900 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">
                <span
                  aria-hidden="true"
                  className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-amber-700 text-sm font-bold"
                >
                  {index + 1}
                </span>
                <span className="flex-1">{faq.question}</span>
                <ChevronDown className="w-5 h-5 mt-1 text-amber-600 flex-shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-gray-600 px-6 pb-6 ml-10">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

