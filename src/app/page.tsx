"use client";

import {
  Recycle,
  Palette,
  Users,
  TrendingUp,
  ArrowRight,
  Heart,
  Globe,
  Award,
  ChevronDown,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { AfricaMap } from "@/components/AfricaMap";
import { useTranslation, Trans } from "react-i18next";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

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
   HERO SECTION
   ============================================ */
function HeroSection() {
  const { t } = useTranslation();
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              <Trans
                i18nKey="home.heroTitle"
                components={{
                  teal: <span className="text-teal-700" />,
                  amber: <span className="text-amber-500" />,
                }}
              />
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              {t("home.heroSubtitle")}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
              <a
                href="/marketplace"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-teal-700 rounded-lg hover:bg-teal-800 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium shadow-lg shadow-teal-700/30 hover:shadow-xl hover:scale-105"
              >
                {t("home.exploreArtwork")}
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="/register?role=artist"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-teal-700 bg-teal-100 rounded-lg hover:bg-teal-800 hover:text-white [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium hover:scale-105"
              >
                {t("home.joinAsArtist")}
                <Palette className="w-5 h-5" />
              </a>
              <a
                href="/book-collection"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-500 hover:text-white [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium hover:scale-105"
              >
                <Truck className="w-5 h-5" />
                {t("home.bookCollection")}
              </a>
            </div>

            {/* Quick Stats - Will be populated with real data once launched */}
            {/* <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-12">
              <div>
                <p className="text-3xl font-bold text-gray-900">-</p>
                <p className="text-sm text-gray-500">Kg Waste Diverted</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">-</p>
                <p className="text-sm text-gray-500">Artists Onboarded</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">-</p>
                <p className="text-sm text-gray-500">Artworks Created</p>
              </div>
            </div> */}
          </div>

          {/* Right Content - Art Preview Collage */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px]">
              {/* Main Image Placeholder */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl shadow-xl transform rotate-3 flex items-center justify-center">
                <div className="text-center p-8">
                  <Palette className="w-16 h-16 text-teal-700 mx-auto mb-4" />
                  <p className="text-teal-700 font-medium">
                    {t("home.featuredArtwork")}
                  </p>
                  <p className="text-sm text-teal-700 mt-2">
                    {t("home.featuredArtworkSub")}
                  </p>
                </div>
              </div>

              {/* Secondary Image Placeholder */}
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl shadow-lg transform -rotate-6 flex items-center justify-center">
                <div className="text-center p-6">
                  <Recycle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                  <p className="text-amber-700 font-medium text-sm">
                    {t("home.upcycledCreation")}
                  </p>
                </div>
              </div>

              {/* Small Accent */}
              <div className="absolute top-40 left-20 w-32 h-32 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl shadow-md transform rotate-12 flex items-center justify-center">
                <Heart className="w-10 h-10 text-teal-500" />
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
  const { t } = useTranslation();
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image/Visual */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-8 flex items-center justify-center">
              <AfricaMap className="h-full w-full" />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-200 rounded-full opacity-60" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-200 rounded-full opacity-40" />
          </div>

          {/* Right - Content */}
          <div>
            <span className="text-teal-700 font-semibold text-sm uppercase tracking-wider">
              {t("home.aboutLabel")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              <Trans i18nKey="home.aboutTitle" components={{ teal: <span className="text-teal-700" /> }} />
            </h2>

            <div className="space-y-4 text-gray-600">
              <p>{t("home.aboutP1")}</p>
              <p>{t("home.aboutP2")}</p>
              <p>{t("home.aboutP3")}</p>
            </div>

            {/* Mission Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <div className="p-4 bg-teal-50 rounded-xl">
                <Recycle className="w-8 h-8 text-teal-700 mb-2" />
                <h4 className="font-semibold text-gray-900">
                  {t("home.circularEconomy")}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t("home.circularEconomyDesc")}
                </p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <Users className="w-8 h-8 text-amber-600 mb-2" />
                <h4 className="font-semibold text-gray-900">
                  {t("home.artistEmpowerment")}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t("home.artistEmpowermentDesc")}
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
  const { t } = useTranslation();
  const steps = [
    {
      number: "01",
      icon: Recycle,
      title: t("home.step1Title"),
      description: t("home.step1Desc"),
      color: "teal",
    },
    {
      number: "02",
      icon: Palette,
      title: t("home.step2Title"),
      description: t("home.step2Desc"),
      color: "amber",
    },
    {
      number: "03",
      icon: TrendingUp,
      title: t("home.step3Title"),
      description: t("home.step3Desc"),
      color: "purple",
    },
    {
      number: "04",
      icon: Heart,
      title: t("home.step4Title"),
      description: t("home.step4Desc"),
      color: "rose",
    },
  ];

  const colorClasses = {
    teal: {
      bg: "bg-teal-100",
      text: "text-teal-700",
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
          <span className="text-teal-700 font-semibold text-sm uppercase tracking-wider">
            {t("home.howLabel")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            {t("home.howTitle")}
          </h2>
          <p className="text-gray-600">
            {t("home.howSubtitle")}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color as keyof typeof colorClasses];
            return (
              <div
                key={index}
                className="relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
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
            className="inline-flex items-center gap-2 text-teal-700 font-medium hover:text-teal-700 transition-colors"
          >
            {t("home.learnMore")}
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
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState({
    kgDiverted: 0,
    artistCount: 0,
    artworkCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setMetrics({
            kgDiverted: data.kgDiverted || 0,
            artistCount: data.artistCount || 0,
            artworkCount: data.artworkCount || 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Format metric value - show "-" for zero/null, otherwise format nicely
  const formatValue = (value: number): string => {
    if (value === 0) return "-";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const stats = [
    {
      value: loading ? "..." : formatValue(metrics.kgDiverted),
      label: t("home.statKgLabel"),
      description: t("home.statKgDesc"),
      icon: Recycle,
    },
    {
      value: loading ? "..." : formatValue(metrics.artistCount),
      label: t("home.statArtistsLabel"),
      description: t("home.statArtistsDesc"),
      icon: Users,
    },
    {
      value: loading ? "..." : formatValue(metrics.artworkCount),
      label: t("home.statArtworksLabel"),
      description: t("home.statArtworksDesc"),
      icon: Palette,
    },
    {
      value: "75-80%",
      label: t("home.statToArtistsLabel"),
      description: t("home.statToArtistsDesc"),
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-200 font-semibold text-sm uppercase tracking-wider">
            {t("home.impactLabel")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
            {t("home.impactTitle")}
          </h2>
          <p className="text-teal-100">
            {t("home.impactSubtitle")}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/15 transition-colors"
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-800 hover:text-white [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] hover:scale-105"
          >
            {t("home.ourImpact")}
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
  const { t } = useTranslation();
  const reasons = [
    {
      icon: Award,
      title: t("home.why1Title"),
      description: t("home.why1Desc"),
    },
    {
      icon: Users,
      title: t("home.why2Title"),
      description: t("home.why2Desc"),
    },
    {
      icon: Globe,
      title: t("home.why3Title"),
      description: t("home.why3Desc"),
    },
    {
      icon: Heart,
      title: t("home.why4Title"),
      description: t("home.why4Desc"),
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-700 font-semibold text-sm uppercase tracking-wider">
            {t("home.whyLabel")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            {t("home.whyTitle")}
          </h2>
          <p className="text-gray-600">
            {t("home.whySubtitle")}
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid sm:grid-cols-2 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <reason.icon className="w-6 h-6 text-orange-600" />
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
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {t("home.ctaTitle")}
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {t("home.ctaSubtitle")}
        </p>

        <div className="group flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white bg-teal-700 rounded-lg group-hover:bg-white group-hover:text-teal-700 border border-transparent group-hover:border-teal-700 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium shadow-lg shadow-teal-700/30 text-lg group-hover:scale-105"
          >
            {t("home.browseArtwork")}
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/register?role=artist"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-teal-700 bg-white border-2 border-teal-200 rounded-lg group-hover:bg-teal-800 group-hover:text-white group-hover:border-teal-700 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium text-lg group-hover:scale-105"
          >
            {t("home.applyAsArtist")}
            <Palette className="w-5 h-5" />
          </a>
        </div>

      </div>
    </section>
  );
}
