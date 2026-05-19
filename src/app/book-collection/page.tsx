"use client";

import {
  Recycle,
  ArrowRight,
  Leaf,
  Menu,
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
import { useState } from "react";
import Footer from "@/components/Footer";

export default function BookCollectionPage() {
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
            <img src="/brand/renewcanvas-icon-full-color.png" alt="RenewCanvas Africa logo" className="w-10 h-10" />
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
                className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
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
                className="block py-2 font-medium text-gray-600 hover:text-teal-600"
              >
                {link.name}
              </a>
            ))}
            <div className="group pt-4 flex flex-col gap-2">
              <a
                href="/login"
                className="w-full py-2 text-center text-teal-700 bg-teal-100 rounded-lg"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="w-full py-2 text-center text-white bg-teal-600 rounded-lg"
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
            Waste Collection Service
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Book a <span className="text-amber-500">Collection</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contribute your recyclable materials and earn discounts on artwork purchases.
            Your waste becomes the canvas for beautiful, sustainable art.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#collection-form"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 [transition:all_0.4s_ease] hover:scale-105 shadow-lg shadow-amber-500/30"
            >
              Schedule Pickup
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#materials"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:border-teal-500 hover:text-teal-600 [transition:all_0.4s_ease]"
            >
              <Package className="w-5 h-5" />
              What We Accept
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
  const steps = [
    {
      number: "01",
      title: "Fill the Form",
      description: "Complete the collection request form with your details and material information.",
      icon: MessageSquare,
    },
    {
      number: "02",
      title: "Schedule Pickup",
      description: "Choose a convenient date and time for our team to collect your materials.",
      icon: Calendar,
    },
    {
      number: "03",
      title: "We Collect",
      description: "Our team arrives at your location to pick up the recyclable materials.",
      icon: Truck,
    },
    {
      number: "04",
      title: "Earn Rewards",
      description: "Receive discount codes based on the weight and type of materials contributed.",
      icon: Gift,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How Collection <span className="text-teal-600">Works</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A simple 4-step process to contribute your recyclables and earn rewards.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-gray-50 rounded-2xl p-6 hover:shadow-lg [transition:all_0.3s_ease] hover:-translate-y-1"
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
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const materials = [
    { id: "plastic", label: "Plastic Bottles & Caps", icon: "🧴" },
    { id: "cardboard", label: "Cardboard & Paper", icon: "📦" },
    { id: "fabric", label: "Fabric & Textiles", icon: "🧵" },
    { id: "metal", label: "Non-hazardous Metals", icon: "🔩" },
    { id: "glass", label: "Glass Containers", icon: "🫙" },
    { id: "electronics", label: "Small Electronics", icon: "📱" },
  ];

  const toggleMaterial = (id: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const inputClasses =
    "w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-400 [transition:all_0.3s_ease]";

  return (
    <section id="collection-form" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
            <Truck className="w-4 h-4" />
            Collection Request
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Schedule Your <span className="text-amber-500">Pickup</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Fill out the form below and we&apos;ll arrange a convenient collection time.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <form className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                Personal Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Your full name"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
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
                    Phone Number *
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
                    I am a...
                  </label>
                  <select id="organizationType" name="organizationType" className={inputClasses}>
                    <option value="individual">Individual / Household</option>
                    <option value="business">Business / Office</option>
                    <option value="school">School / Institution</option>
                    <option value="organization">NGO / Organization</option>
                    <option value="recycler">Waste Picker / Recycler</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Pickup Location
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Street name, building, house number"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                    District / Area *
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    placeholder="e.g., Kicukiro, Gasabo"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="e.g., Kigali"
                    className={inputClasses}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark / Additional Directions
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  placeholder="Near the main market, opposite the school, etc."
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Materials Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                Materials to Collect
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Select all materials you want to contribute (select at least one)
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {materials.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    onClick={() => toggleMaterial(material.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 [transition:all_0.3s_ease] ${
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
                Estimated Quantity
              </label>
              <select id="quantity" name="quantity" className={inputClasses}>
                <option value="small">Small (fits in a shopping bag)</option>
                <option value="medium">Medium (1-2 large bags)</option>
                <option value="large">Large (3-5 large bags)</option>
                <option value="bulk">Bulk (more than 5 bags / requires vehicle)</option>
              </select>
            </div>

            {/* Preferred Schedule */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Preferred Schedule
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date *
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
                    Preferred Time *
                  </label>
                  <select id="preferredTime" name="preferredTime" className={inputClasses} required>
                    <option value="">Select a time slot</option>
                    <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                    <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                    <option value="evening">Evening (4:00 PM - 6:00 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Any special instructions for pickup, access codes, etc."
                className={`${inputClasses} resize-none`}
              />
            </div>

            {/* Info Box */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-teal-700">
                  <p className="font-medium mb-1">What happens next?</p>
                  <p>
                    After submitting, our team will review your request and contact you within
                    24-48 hours to confirm the collection details. You&apos;ll receive a confirmation
                    email with your collection reference number.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 [transition:all_0.4s_ease] hover:scale-[1.02] shadow-lg shadow-amber-500/30"
            >
              <Truck className="w-5 h-5" />
              Submit Collection Request
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
  const acceptedMaterials = [
    {
      category: "Plastics",
      items: ["PET bottles", "HDPE containers", "Bottle caps", "Clean plastic bags"],
      color: "teal",
    },
    {
      category: "Paper & Cardboard",
      items: ["Cardboard boxes", "Newspapers", "Magazines", "Office paper"],
      color: "amber",
    },
    {
      category: "Textiles",
      items: ["Fabric scraps", "Old clothes", "Textile remnants", "Thread spools"],
      color: "purple",
    },
    {
      category: "Metals",
      items: ["Aluminum cans", "Tin cans", "Metal bottle caps", "Small metal objects"],
      color: "gray",
    },
  ];

  const notAccepted = [
    "Hazardous materials",
    "Medical waste",
    "Batteries",
    "Paint or chemicals",
    "Food-contaminated items",
    "Broken glass",
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
            Materials We <span className="text-teal-600">Accept</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We accept various recyclable materials that our artists transform into beautiful art pieces.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {acceptedMaterials.map((material, index) => {
            const colors = colorClasses[material.color];
            return (
              <div
                key={index}
                className={`${colors.bg} border ${colors.border} rounded-2xl p-6 hover:shadow-lg [transition:all_0.3s_ease]`}
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-4">Materials We Cannot Accept</h3>
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
  const benefits = [
    {
      icon: Gift,
      title: "Earn Discounts",
      description: "Get discount codes for artwork purchases based on the weight of materials you contribute.",
    },
    {
      icon: Recycle,
      title: "Support Sustainability",
      description: "Your materials are transformed into art, reducing waste and supporting circular economy.",
    },
    {
      icon: Truck,
      title: "Free Pickup",
      description: "We come to your location at no cost. Just schedule a convenient time and we handle the rest.",
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
            Why Book a Collection?
          </h2>
          <p className="text-teal-100 max-w-2xl mx-auto">
            Contributing your recyclables benefits you, the environment, and local artists.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 [transition:all_0.3s_ease]"
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
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

