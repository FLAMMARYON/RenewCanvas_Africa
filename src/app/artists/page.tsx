"use client";

import {
  Recycle,
  Palette,
  ArrowRight,
  Leaf,
  Package,
  DollarSign,
  Eye,
  CheckCircle,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useTranslation } from "react-i18next";

export default function ArtistsPage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Why Join Section */}
      <WhyJoinSection />

      {/* How to Join Section */}
      <HowToJoinSection />

      {/* CTA Section */}
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
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-teal-50" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-amber-200/50 rounded-full blur-2xl" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-teal-200/50 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-6">
            <Palette className="w-4 h-4" />
            <span>{t("artists.heroLabel")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {t("artists.heroHeadingPart1")}{" "}
            <span className="text-amber-500">{t("artists.heroHeadingTalent")}</span>{" "}
            {t("artists.heroHeadingInto")}{" "}
            <span className="text-teal-600">{t("artists.heroHeadingImpact")}</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            {t("artists.heroSubheading")}
          </p>

          <a
            href="/register?role=artist"
            className="inline-flex items-center gap-2 px-6 py-3 text-white bg-amber-500 rounded-lg hover:bg-white hover:text-amber-600 border border-transparent hover:border-amber-500 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium hover:scale-105"
          >
            {t("artists.applyAsArtist")}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   WHY JOIN SECTION
   ============================================ */
function WhyJoinSection() {
  const { t } = useTranslation();
  const benefits = [
    {
      icon: Package,
      title: t("artists.benefitMaterialsTitle"),
      description: t("artists.benefitMaterialsDescription"),
      color: "teal",
      comingSoon: false,
    },
    {
      icon: DollarSign,
      title: t("artists.benefitEarningsTitle"),
      description: t("artists.benefitEarningsDescription"),
      color: "green",
      comingSoon: false,
    },
    {
      icon: Eye,
      title: t("artists.benefitVisibilityTitle"),
      description: t("artists.benefitVisibilityDescription"),
      color: "blue",
      comingSoon: false,
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    teal: { bg: "bg-teal-100", text: "text-teal-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600" },
    rose: { bg: "bg-rose-100", text: "text-rose-600" },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">
            {t("artists.whyJoinLabel")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            {t("artists.whyJoinHeadingPart1")}{" "}
            <span className="text-amber-500">{t("artists.whyJoinHeadingHighlight")}</span>
          </h2>
          <p className="text-gray-600">
            {t("artists.whyJoinSubheading")}
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const colors = colorClasses[benefit.color];
            return (
              <div
                key={index}
                className="relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] hover:scale-105 cursor-pointer"
              >
                {benefit.comingSoon && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    {t("artists.comingSoon")}
                  </span>
                )}
                <div
                  className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <benefit.icon className={`w-7 h-7 ${colors.text}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   HOW TO JOIN SECTION
   ============================================ */
function HowToJoinSection() {
  const { t } = useTranslation();
  const steps = [
    {
      number: "01",
      title: t("artists.step1Title"),
      description: t("artists.step1Description"),
    },
    {
      number: "02",
      title: t("artists.step2Title"),
      description: t("artists.step2Description"),
    },
    {
      number: "03",
      title: t("artists.step3Title"),
      description: t("artists.step3Description"),
    },
    {
      number: "04",
      title: t("artists.step4Title"),
      description: t("artists.step4Description"),
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
              {t("artists.howToJoinLabel")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              {t("artists.howToJoinHeadingPart1")}{" "}
              <span className="text-teal-600">{t("artists.howToJoinHeadingHighlight")}</span>
            </h2>
            <p className="text-gray-600 mb-8">
              {t("artists.howToJoinSubheading")}
            </p>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <a
                href="/register?role=artist"
                className="inline-flex items-center gap-2 px-6 py-3 text-white bg-teal-600 rounded-lg hover:bg-white hover:text-teal-600 border border-transparent hover:border-teal-600 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium hover:scale-105"
              >
                {t("artists.applyNow")}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="group aspect-square rounded-xl overflow-hidden shadow-xl cursor-pointer transition-shadow duration-300 hover:shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80"
                alt={t("artists.artistAtWorkAlt")}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Teal hue overlay */}
              <div className="absolute inset-0 bg-teal-600/0 transition-all duration-300 group-hover:bg-teal-600/40" />
              {/* Centered Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Palette className="w-10 h-10 text-teal-600" />
                </div>
              </div>
              {/* Bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Palette className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t("artists.createWithPurpose")}</p>
                    <p className="text-sm text-gray-600">{t("artists.createWithPurposeSubtitle")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-200 rounded-full opacity-50 -z-10" />
          </div>
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
  const requirements = [
    t("artists.requirementPortfolio"),
    t("artists.requirementLocation"),
    t("artists.requirementCommitment"),
    t("artists.requirementWillingness"),
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          {t("artists.ctaHeading")}
        </h2>
        <p className="text-lg text-teal-100 mb-8 max-w-2xl mx-auto">
          {t("artists.ctaSubheading")}
        </p>

        {/* Requirements */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 max-w-xl mx-auto">
          <h3 className="font-semibold mb-4">{t("artists.whatWeLookFor")}</h3>
          <ul className="space-y-3 text-left">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-teal-100">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="group flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register?role=artist"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-teal-700 bg-white rounded-lg group-hover:bg-teal-600 group-hover:text-white group-hover:border-white border border-transparent [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium text-lg group-hover:scale-105"
          >
            {t("artists.applyAsArtist")}
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white border-2 border-white/50 rounded-lg group-hover:bg-white group-hover:text-teal-700 group-hover:border-white [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium text-lg group-hover:scale-105"
          >
            {t("artists.haveQuestions")}
          </a>
        </div>
      </div>
    </section>
  );
}

