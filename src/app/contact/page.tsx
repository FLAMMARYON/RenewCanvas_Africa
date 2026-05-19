"use client";

import {
  Recycle,
  ArrowRight,
  Leaf,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Users,
  Palette,
  Building,
  ExternalLink,
  Briefcase,
  Image,
  FileText,
  Globe,
  Truck,
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
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

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
   NAVIGATION COMPONENT
   ============================================ */
function Navigation({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Artists", href: "/artists" },
    { name: "Impact", href: "/impact" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img
              src="/brand/renewcanvas-icon-full-color.png"
              alt="RenewCanvas Africa logo"
              className="w-10 h-10"
            />
            <span className="text-xl font-bold">
              <span className="text-black">Renew</span><span style={{ color: "#0D5C4D" }}>Canvas</span>{" "}
              <span style={{ color: "#F7941D" }}>Africa</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.href === "/contact"
                    ? "text-teal-600"
                    : "text-gray-600 hover:text-teal-600"
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="group hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-100 rounded-lg group-hover:bg-teal-600 group-hover:text-white [transition:all_0.4s_ease] group-hover:scale-105"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg group-hover:bg-white group-hover:text-teal-600 border border-transparent group-hover:border-teal-600 [transition:all_0.4s_ease] group-hover:scale-105"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-600 z-50 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4">
          <div className="max-w-7xl mx-auto px-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`block py-2 font-medium ${
                  link.href === "/contact"
                    ? "text-teal-600"
                    : "text-gray-600 hover:text-teal-600"
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="group pt-4 flex flex-col gap-2">
              <a
                href="/login"
                className="w-full py-2 text-center text-teal-700 bg-teal-100 rounded-lg group-hover:bg-teal-600 group-hover:text-white [transition:all_0.4s_ease] group-hover:scale-105"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="w-full py-2 text-center text-white bg-teal-600 rounded-lg group-hover:bg-white group-hover:text-teal-600 border border-transparent group-hover:border-teal-600 [transition:all_0.4s_ease] group-hover:scale-105"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ============================================
   HERO SECTION
   ============================================ */
function HeroSection() {
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
            Get In Touch
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Contact <span className="text-teal-600">Us</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get in touch with us for any enquiries. Let&apos;s work together to
            transform waste into art and build a sustainable future.
          </p>

          <div className="group flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white border-2 border-teal-600 rounded-xl font-medium group-hover:bg-white group-hover:text-teal-600 [transition:all_0.4s_ease] group-hover:scale-105 shadow-lg shadow-teal-600/30"
            >
              Send a Message
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/book-collection"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white border-2 border-amber-500 rounded-xl font-medium group-hover:bg-white group-hover:text-amber-500 [transition:all_0.4s_ease] group-hover:scale-105 shadow-lg shadow-amber-500/30"
            >
              <Truck className="w-5 h-5" />
              Book a Collection
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
  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: ["hello.renewcanvas.africa@gmail.com"],
      color: "teal",
      href: "mailto:hello.renewcanvas.africa@gmail.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+250 798 654 776"],
      subtext: "Mon-Fri, 9am-5pm EAT",
      color: "purple",
      href: "tel:+250798654776",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["Kigali, Rwanda"],
      subtext: "By appointment only",
      color: "amber",
      href: "https://maps.google.com/?q=Kigali,Rwanda",
    },
    {
      icon: LinkedInIcon,
      title: "LinkedIn",
      details: ["RenewCanvas Africa"],
      subtext: "Follow us for updates",
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
                className={`${colors.bg} border ${colors.border} rounded-2xl p-6 text-center hover:shadow-lg [transition:all_0.3s_ease] hover:-translate-y-1 block`}
              >
                <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
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

        {/* Social Links */}
        <div className="mt-12 text-center">
          <h3 className="font-semibold text-gray-900 mb-4">Connect With Us</h3>
          <div className="flex justify-center gap-4">
            <a
              href="https://www.linkedin.com/company/renewcanvas-africa/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
            >
              <LinkedInIcon className="w-6 h-6 text-blue-600" />
            </a>
            <a
              href="mailto:hello.renewcanvas.africa@gmail.com"
              className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center hover:bg-teal-200 transition-colors"
            >
              <Mail className="w-6 h-6 text-teal-600" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   BOOK COLLECTION CTA
   ============================================ */
function BookCollectionCTA() {
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
              Contribute to Sustainability
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Have Recyclable Materials?
            </h2>
            <p className="text-white/90 text-lg max-w-xl">
              Book a collection and contribute your recyclable materials. Earn discounts
              on artwork purchases while helping our artists create sustainable masterpieces.
            </p>
          </div>

          <div className="group flex flex-col sm:flex-row gap-4">
            <a
              href="/book-collection"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-amber-500 border-2 border-white rounded-xl font-bold group-hover:bg-amber-500 group-hover:text-white group-hover:border-white [transition:all_0.4s_ease] group-hover:scale-105 shadow-lg"
            >
              <Truck className="w-5 h-5" />
              Book a Collection
            </a>
            <a
              href="/how-it-works#collection"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 text-white border-2 border-teal-600 rounded-xl font-medium group-hover:bg-white group-hover:text-teal-600 [transition:all_0.4s_ease] group-hover:scale-105"
            >
              Learn More
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
        message: "Please fill in all required fields (Name, Email, and Message).",
      });
      setIsSubmitting(false);
      return;
    }

    // Map inquiry type to API type
    const typeMap: Record<string, string> = {
      general: "contact_form",
      artist: "artist_application",
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
            selectedInquiry === "artist"
              ? {
                  location: formData.location,
                  portfolio: formData.portfolio,
                  artStyle: formData.artStyle,
                  experience: formData.experience,
                }
              : selectedInquiry === "partnership"
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
          message: data.message || "Thank you! Your message has been sent successfully.",
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
          message: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inquiryTypes = [
    { icon: Users, label: "General Inquiry", value: "general", color: "teal" },
    { icon: Palette, label: "Artist Application", value: "artist", color: "purple" },
    { icon: Building, label: "Partnership", value: "partnership", color: "amber" },
  ];

  const inquiryColorClasses: Record<string, { selectedBg: string; icon: string; border: string }> = {
    teal: { selectedBg: "bg-teal-100", icon: "text-teal-600", border: "border-teal-500" },
    purple: { selectedBg: "bg-purple-100", icon: "text-purple-600", border: "border-purple-500" },
    amber: { selectedBg: "bg-amber-100", icon: "text-amber-600", border: "border-amber-500" },
  };

  const inputClasses = "w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder-gray-400 [transition:all_0.3s_ease]";

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
            Send Us a <span className="text-teal-600">Message</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Choose the type of inquiry and fill out the form below.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl">
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
                What can we help you with?
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
                      className={`relative flex items-center gap-3 p-4 bg-white border-2 rounded-xl cursor-pointer [transition:all_0.3s_ease] ${
                        isSelected ? colors.border : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center [transition:all_0.3s_ease] ${
                        isSelected ? colors.selectedBg : "bg-gray-100"
                      }`}>
                        <type.icon className={`w-5 h-5 [transition:all_0.3s_ease] ${
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
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" required className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" required className={inputClasses} />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="How can we help?" className={inputClasses} />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={5} placeholder="Tell us more about your inquiry..." required className={`${inputClasses} resize-none`} />
                </div>
              </div>
            )}

            {/* ===== ARTIST APPLICATION FORM ===== */}
            {selectedInquiry === "artist" && (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-sm text-purple-700">
                    <Palette className="w-4 h-4 inline mr-2" />
                    Join our community of artists creating sustainable art from recycled materials.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" required className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="artist@example.com" required className={inputClasses} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+250 798 654 776" className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location / City
                    </label>
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder="Kigali, Rwanda" className={inputClasses} />
                  </div>
                </div>

                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
                    <ExternalLink className="w-4 h-4 inline mr-1" />
                    Portfolio Link (Website, Instagram, etc.)
                  </label>
                  <input type="url" id="portfolio" name="portfolio" value={formData.portfolio} onChange={handleInputChange} placeholder="https://your-portfolio.com" className={inputClasses} />
                </div>

                <div>
                  <label htmlFor="artStyle" className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" />
                    Art Style / Medium
                  </label>
                  <input type="text" id="artStyle" name="artStyle" value={formData.artStyle} onChange={handleInputChange} placeholder="e.g., Sculpture, Painting, Mixed Media, Textile Art" className={inputClasses} />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience with Recycled Materials
                  </label>
                  <select id="experience" name="experience" value={formData.experience} onChange={handleInputChange} className={inputClasses}>
                    <option value="">Select your experience level</option>
                    <option value="beginner">Beginner - New to upcycled art</option>
                    <option value="intermediate">Intermediate - Some experience</option>
                    <option value="experienced">Experienced - Regular upcycled art creator</option>
                    <option value="professional">Professional - Full-time artist</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Tell Us About Yourself <span className="text-red-500">*</span>
                  </label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={4} placeholder="Share your artistic journey, inspiration, and why you want to join RenewCanvas..." required className={`${inputClasses} resize-none`} />
                </div>
              </div>
            )}

            {/* ===== PARTNERSHIP FORM ===== */}
            {selectedInquiry === "partnership" && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-700">
                    <Building className="w-4 h-4 inline mr-2" />
                    Partner with us to promote sustainability and support local artists.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your full name" required className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Email <span className="text-red-500">*</span>
                    </label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="contact@company.com" required className={inputClasses} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Organization / Company
                    </label>
                    <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleInputChange} placeholder="Company name" className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Website
                    </label>
                    <input type="url" id="website" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://company.com" className={inputClasses} />
                  </div>
                </div>

                <div>
                  <label htmlFor="partnershipType" className="block text-sm font-medium text-gray-700 mb-2">
                    Partnership Type
                  </label>
                  <select id="partnershipType" name="partnershipType" value={formData.partnershipType} onChange={handleInputChange} className={inputClasses}>
                    <option value="">Select partnership type</option>
                    <option value="sponsor">Sponsorship</option>
                    <option value="material">Material Supply Partnership</option>
                    <option value="corporate">Corporate Art Purchases</option>
                    <option value="event">Event Collaboration</option>
                    <option value="media">Media / Press Partnership</option>
                    <option value="ngo">NGO / Non-Profit Collaboration</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Partnership Proposal <span className="text-red-500">*</span>
                  </label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} rows={5} placeholder="Describe your partnership idea, what you hope to achieve, and how we can work together..." required className={`${inputClasses} resize-none`} />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-white rounded-xl [transition:all_0.4s_ease] font-medium hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                selectedInquiry === "general"
                  ? "bg-teal-600 hover:bg-teal-700 shadow-teal-600/30"
                  : selectedInquiry === "artist"
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/30"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  {selectedInquiry === "artist" ? "Submit Application" : selectedInquiry === "partnership" ? "Submit Proposal" : "Send Message"}
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
  const faqs = [
    {
      question: "How do I become an artist on RenewCanvas?",
      answer:
        "You can apply through our artist application form above. We review all applications and look for artists who are passionate about sustainable art and have a portfolio showcasing their work.",
    },
    {
      question: "What materials do you provide to artists?",
      answer:
        "We provide cleaned and sorted recyclable materials including plastic bottles, cardboard, fabric scraps, and more. All materials are sanitized and ready for creative use.",
    },
    {
      question: "How does the waste-to-discount program work?",
      answer:
        "Book a collection through our platform, and we will pick up your recyclable materials. You will receive discount codes based on the weight of materials contributed. The more you contribute, the bigger your discount on artwork purchases.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "We are starting with local delivery in Rwanda and will expand to international shipping soon. Sign up to be notified when international shipping becomes available.",
    },
    {
      question: "Can buyers contact artists directly?",
      answer:
        "No. RenewCanvas admins handle order, delivery, return, and payment communication. Buyers pay RenewCanvas Africa directly, and artists receive payouts through their private payout details after the 48-hour return request window.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            <span>FAQ</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="text-amber-500">Questions</span>
          </h2>
          <p className="text-gray-600">
            Quick answers to common questions about RenewCanvas Africa.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-amber-50 rounded-2xl p-6 border-l-4 border-amber-400 hover:shadow-lg [transition:all_0.3s_ease] hover:-translate-y-1"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-3">
                <span className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 text-amber-700 text-sm font-bold">
                  {index + 1}
                </span>
                {faq.question}
              </h3>
              <p className="text-gray-600 ml-10">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

