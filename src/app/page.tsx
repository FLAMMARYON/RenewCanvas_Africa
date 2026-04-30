"use client";

import {
  Recycle,
  Palette,
  Users,
  TrendingUp,
  ArrowRight,
  Leaf,
  Heart,
  Globe,
  Award,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

export default function HomePage() {
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

      {/* About/Mission Section */}
      <AboutSection />

      {/* How It Works Preview */}
      <HowItWorksSection />

      {/* Impact Section */}
      <ImpactSection />

      {/* Why RenewCanvas Section */}
      <WhySection />

      {/* Call to Action */}
      <CTASection />

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
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Renew<span className="text-teal-600">Canvas</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-teal-600 transition-colors font-medium text-sm"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
                className="block py-2 text-gray-600 hover:text-teal-600 font-medium"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <a
                href="/login"
                className="w-full py-2 text-center text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="w-full py-2 text-center text-white bg-teal-600 rounded-lg hover:bg-teal-700"
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
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50">
        <div className="absolute inset-0 opacity-30">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id="grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="0.5" fill="#0d9488" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-32 left-10 w-20 h-20 bg-teal-200 rounded-full opacity-50 animate-float" />
      <div
        className="absolute bottom-32 right-10 w-32 h-32 bg-amber-200 rounded-full opacity-40 animate-float"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-16 h-16 bg-purple-200 rounded-full opacity-40 animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              <span>Circular Economy Art Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Transforming{" "}
              <span className="text-teal-600">Waste</span> Into{" "}
              <span className="text-amber-500">Art</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              RenewCanvas Africa connects recycled materials with talented
              artists to create unique, impact-verified artwork. Every piece
              tells a story of transformation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-all font-medium shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40"
              >
                Explore Artwork
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/register?role=artist"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-teal-700 bg-teal-100 rounded-lg hover:bg-teal-200 transition-all font-medium"
              >
                Join as Artist
                <Palette className="w-5 h-5" />
              </a>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12">
              <div>
                <p className="text-3xl font-bold text-gray-900">500+</p>
                <p className="text-sm text-gray-500">Kg Waste Diverted</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">25+</p>
                <p className="text-sm text-gray-500">Artists Onboarded</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">100+</p>
                <p className="text-sm text-gray-500">Artworks Created</p>
              </div>
            </div>
          </div>

          {/* Right Content - Art Preview Collage */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px]">
              {/* Main Image Placeholder */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl shadow-xl transform rotate-3 flex items-center justify-center">
                <div className="text-center p-8">
                  <Palette className="w-16 h-16 text-teal-600 mx-auto mb-4" />
                  <p className="text-teal-700 font-medium">
                    Featured Artwork
                  </p>
                  <p className="text-sm text-teal-600 mt-2">
                    Made from recycled materials
                  </p>
                </div>
              </div>

              {/* Secondary Image Placeholder */}
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl shadow-lg transform -rotate-6 flex items-center justify-center">
                <div className="text-center p-6">
                  <Recycle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                  <p className="text-amber-700 font-medium text-sm">
                    Upcycled Creation
                  </p>
                </div>
              </div>

              {/* Small Accent */}
              <div className="absolute top-40 left-20 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-md transform rotate-12 flex items-center justify-center">
                <Heart className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-8 h-8 text-gray-400" />
      </div>
    </section>
  );
}

/* ============================================
   ABOUT SECTION
   ============================================ */
function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image/Visual */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <Globe className="w-16 h-16 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Based in Kigali, Rwanda
                </h3>
                <p className="text-gray-600">
                  Serving artists and buyers across Africa
                </p>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-200 rounded-full opacity-60" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-200 rounded-full opacity-40" />
          </div>

          {/* Right - Content */}
          <div>
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
              About Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              A Platform Where Waste Becomes{" "}
              <span className="text-teal-600">Masterpiece</span>
            </h2>

            <div className="space-y-4 text-gray-600">
              <p>
                RenewCanvas Africa is a technology-driven circular arts platform
                that transforms the waste crisis into creative opportunity. We
                collect specific recyclable materials, distribute them to
                curated artists, and connect their unique creations with buyers
                who value sustainability and impact.
              </p>
              <p>
                Every artwork on our platform comes with a verified
                environmental impact story—you will know exactly how much waste was
                diverted, which artist created it, and the journey from
                discarded material to treasured art piece.
              </p>
              <p>
                We are not just a marketplace. We are a movement to prove that
                waste can be beautiful, that African artists deserve global
                recognition, and that conscious consumers can make a real
                difference.
              </p>
            </div>

            {/* Mission Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-teal-50 rounded-xl">
                <Recycle className="w-8 h-8 text-teal-600 mb-2" />
                <h4 className="font-semibold text-gray-900">
                  Circular Economy
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Turning waste into valuable resources
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <Users className="w-8 h-8 text-amber-600 mb-2" />
                <h4 className="font-semibold text-gray-900">
                  Artist Empowerment
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Creating sustainable income for creatives
                </p>
              </div>
            </div>
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
      icon: Recycle,
      title: "We Collect & Clean",
      description:
        "We source recyclable materials—plastics, fabrics, metals—from verified partners, clean and sort them for artistic use.",
      color: "teal",
    },
    {
      number: "02",
      icon: Palette,
      title: "Artists Create",
      description:
        "Our curated artists transform these materials into stunning paintings, sculptures, jewelry, and home décor.",
      color: "amber",
    },
    {
      number: "03",
      icon: TrendingUp,
      title: "Impact Tracked",
      description:
        "Every artwork is logged with its environmental impact—kg of waste diverted, materials used, artist earnings.",
      color: "purple",
    },
    {
      number: "04",
      icon: Heart,
      title: "You Support",
      description:
        "Purchase unique art, commission custom pieces, or sponsor donations to schools. Every action creates real impact.",
      color: "rose",
    },
  ];

  const colorClasses = {
    teal: {
      bg: "bg-teal-100",
      text: "text-teal-600",
      border: "border-teal-200",
    },
    amber: {
      bg: "bg-amber-100",
      text: "text-amber-600",
      border: "border-amber-200",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
      border: "border-purple-200",
    },
    rose: {
      bg: "bg-rose-100",
      text: "text-rose-600",
      border: "border-rose-200",
    },
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            From Waste to Wonder in Four Steps
          </h2>
          <p className="text-gray-600">
            Our platform creates a transparent, traceable journey from discarded
            materials to cherished artwork.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color as keyof typeof colorClasses];
            return (
              <div
                key={index}
                className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Step Number */}
                <span className="absolute -top-3 -right-3 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <step.icon className={`w-7 h-7 ${colors.text}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
          >
            Learn more about our process
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   IMPACT SECTION
   ============================================ */
function ImpactSection() {
  const stats = [
    {
      value: "500+",
      label: "Kg Waste Diverted",
      description: "Plastic, fabric, and materials saved from landfills",
      icon: Recycle,
    },
    {
      value: "25+",
      label: "Artists Empowered",
      description: "Talented creators earning sustainable income",
      icon: Users,
    },
    {
      value: "100+",
      label: "Artworks Created",
      description: "Unique pieces with verified impact stories",
      icon: Palette,
    },
    {
      value: "$5,000+",
      label: "Artist Earnings",
      description: "Income generated for local artists",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-200 font-semibold text-sm uppercase tracking-wider">
            Our Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
            Real Numbers, Real Change
          </h2>
          <p className="text-teal-100">
            Every purchase on RenewCanvas Africa contributes to measurable
            environmental and social impact.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/15 transition-colors"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <p className="text-4xl font-bold mb-2">{stat.value}</p>
              <p className="font-semibold text-lg mb-1">{stat.label}</p>
              <p className="text-sm text-teal-200">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/impact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors"
          >
            View Full Impact Report
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   WHY RENEWCANVAS SECTION
   ============================================ */
function WhySection() {
  const reasons = [
    {
      icon: Award,
      title: "Verified Impact",
      description:
        "Every artwork comes with documented environmental impact—kg of waste diverted and materials traced.",
    },
    {
      icon: Users,
      title: "Curated Artists",
      description:
        "Our artists are vetted for skill and commitment. You are buying from talented, verified creators.",
    },
    {
      icon: Globe,
      title: "African Excellence",
      description:
        "Celebrating African creativity and craftsmanship while solving a local environmental challenge.",
    },
    {
      icon: Heart,
      title: "Community Impact",
      description:
        "Support school donations, artist training, and community clean-up initiatives through your purchase.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Art With Purpose, Impact With Proof
          </h2>
          <p className="text-gray-600">
            RenewCanvas Africa is not just another art marketplace. We are building a
            transparent, traceable circular economy for creative expression.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid sm:grid-cols-2 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <reason.icon className="w-6 h-6 text-teal-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {reason.title}
                </h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CTA SECTION
   ============================================ */
function CTASection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Ready to Make an Impact?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Whether you want to buy unique art, join as an artist, or partner with
          us for corporate impact—there is a place for you in the RenewCanvas
          community.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-all font-medium shadow-lg shadow-teal-600/30 text-lg"
          >
            Browse Artwork
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/register?role=artist"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-teal-700 bg-white border-2 border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition-all font-medium text-lg"
          >
            Apply as Artist
            <Palette className="w-5 h-5" />
          </a>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-400">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            <span className="text-sm">Eco-Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="text-sm">Quality Guaranteed</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="text-sm">Artist-First Platform</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FOOTER COMPONENT
   ============================================ */
function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "How It Works", href: "/how-it-works" },
      { name: "Marketplace", href: "/marketplace" },
      { name: "Artists", href: "/artists" },
      { name: "Impact", href: "/impact" },
    ],
    company: [
      { name: "About Us", href: "/#about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
    support: [
      { name: "FAQ", href: "/faq" },
      { name: "Help Center", href: "/help" },
      { name: "Shipping", href: "/shipping" },
      { name: "Returns", href: "/returns" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refund-policy" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Renew<span className="text-teal-400">Canvas</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Transforming waste into art, one masterpiece at a time.
            </p>
            <p className="text-sm text-gray-500">Kigali, Rwanda</p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm hover:text-teal-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} RenewCanvas Africa. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Leaf className="w-4 h-4 text-teal-500" />
            <span>Built for a sustainable future</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
