"use client";

import {
  Recycle,
  Palette,
  TrendingUp,
  Heart,
  ArrowRight,
  Leaf,
  X,
  CheckCircle,
  Truck,
  Search,
  ShoppingBag,
  Users,
  Package,
  ClipboardCheck,
  HandHeart,
  CircleDot,
  FileText,
  Scissors,
  Shirt,
  Container,
  AlertTriangle,
  AlertOctagon,
  FlaskConical,
  Biohazard,
  GlassWater,
  Gift,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useTranslation } from "react-i18next";

export default function HowItWorksPage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Process Steps */}
      <ProcessStepsSection />

      {/* For Artists Section */}
      <ForArtistsSection />

      {/* For Buyers Section */}
      <ForBuyersSection />

      {/* Waste-to-Discount Section */}
      <WasteToDiscountSection />

      {/* Materials We Accept */}
      <MaterialsSection />

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
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
            <span>{t("howItWorks.heroBadge")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {t("howItWorks.heroTitlePrefix")} <span className="text-teal-600">{t("howItWorks.heroTitleWaste")}</span> {t("howItWorks.heroTitleTo")}{" "}
            <span className="text-amber-500">{t("howItWorks.heroTitleMasterpiece")}</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            {t("howItWorks.heroSubtitle")}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 text-teal-700 bg-white border-2 border-teal-200 rounded-lg hover:bg-teal-600 hover:text-white hover:border-teal-600 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium hover:scale-105"
            >
              {t("howItWorks.heroBrowseArtwork")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PROCESS STEPS SECTION
   ============================================ */
function ProcessStepsSection() {
  const { t } = useTranslation();
  const steps = [
    {
      number: "01",
      icon: Recycle,
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Desc"),
      details: [
        t("howItWorks.step1Detail1"),
        t("howItWorks.step1Detail2"),
        t("howItWorks.step1Detail3"),
        t("howItWorks.step1Detail4"),
      ],
      color: "teal",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
    },
    {
      number: "02",
      icon: ClipboardCheck,
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Desc"),
      details: [
      ],
      color: "amber",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    },
    {
      number: "03",
      icon: Palette,
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Desc"),
      details: [
        t("howItWorks.step3Detail1"),
        t("howItWorks.step3Detail2"),
        t("howItWorks.step3Detail3"),
        t("howItWorks.step3Detail4"),
      ],
      color: "purple",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    },
    {
      number: "04",
      icon: TrendingUp,
      title: t("howItWorks.step4Title"),
      description: t("howItWorks.step4Desc"),
      details: [
        t("howItWorks.step4Detail1"),
        t("howItWorks.step4Detail2"),
        t("howItWorks.step4Detail3"),
      ],
      color: "rose",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    },
    {
      number: "05",
      icon: ShoppingBag,
      title: t("howItWorks.step5Title"),
      description: t("howItWorks.step5Desc"),
      details: [
        t("howItWorks.step5Detail1"),
        t("howItWorks.step5Detail2"),
      ],
      color: "blue",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
    },
    {
      number: "06",
      icon: Heart,
      title: t("howItWorks.step6Title"),
      description: t("howItWorks.step6Desc"),
      details: [
        t("howItWorks.step6Detail1"),
      ],
      color: "teal",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; hue: string; hueHover: string }> = {
    teal: { bg: "bg-teal-100", text: "text-teal-600", hue: "bg-teal-600/0", hueHover: "group-hover:bg-teal-600/50" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", hue: "bg-amber-600/0", hueHover: "group-hover:bg-amber-600/50" },
    purple: { bg: "bg-purple-100", text: "text-purple-600", hue: "bg-purple-600/0", hueHover: "group-hover:bg-purple-600/50" },
    rose: { bg: "bg-rose-100", text: "text-rose-600", hue: "bg-rose-600/0", hueHover: "group-hover:bg-rose-600/50" },
    blue: { bg: "bg-blue-100", text: "text-blue-600", hue: "bg-blue-600/0", hueHover: "group-hover:bg-blue-600/50" },
  };

  return (
    <section id="process" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
            {t("howItWorks.processLabel")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            {t("howItWorks.processHeading")}
          </h2>
          <p className="text-gray-600">
            {t("howItWorks.processSubtitle")}
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => {
            const colors = colorClasses[step.color];
            const isEven = index % 2 === 1;

            return (
              <div
                key={index}
                className={`flex flex-col ${
                  isEven ? "lg:flex-row-reverse" : "lg:flex-row"
                } gap-8 items-center`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-4xl font-bold text-gray-200">
                      {step.number}
                    </span>
                    <div
                      className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}
                    >
                      <step.icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>

                  <ul className="space-y-2">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0" />
                        <span className="text-gray-600">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Book Collection CTA - Only show for Material Collection step */}
                  {step.number === "01" && (
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-amber-800 text-sm mb-3">
                        {t("howItWorks.bookCollectionPrompt")}
                      </p>
                      <a
                        href="/book-collection"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 [transition:all_0.3s_cubic-bezier(0.4,0,0.2,1)] text-sm"
                      >
                        <Truck className="w-4 h-4" />
                        {t("howItWorks.bookCollectionCta")}
                      </a>
                    </div>
                  )}
                </div>

                {/* Visual - Image with hue + zoom hover effects */}
                <div className="flex-1 w-full">
                  <div className="group relative aspect-video rounded-xl overflow-hidden shadow-lg cursor-pointer transition-shadow duration-300 hover:shadow-2xl">
                    {/* Background Image with zoom effect */}
                    <img
                      src={step.image}
                      alt={step.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Color Hue Overlay - matches icon color, appears on hover */}
                    <div className={`absolute inset-0 ${colors.hue} ${colors.hueHover} transition-all duration-300`} />
                    {/* Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                        <step.icon className={`w-10 h-10 ${colors.text}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FOR ARTISTS SECTION
   ============================================ */
function ForArtistsSection() {
  const { t } = useTranslation();
  const benefits = [
    {
      icon: Package,
      title: t("howItWorks.artistBenefit1Title"),
      description: t("howItWorks.artistBenefit1Desc"),
    },
    {
      icon: Users,
      title: t("howItWorks.artistBenefit2Title"),
      description: t("howItWorks.artistBenefit2Desc"),
    },
    {
      icon: TrendingUp,
      title: t("howItWorks.artistBenefit3Title"),
      description: t("howItWorks.artistBenefit3Desc"),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">
              {t("howItWorks.artistsLabel")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              {t("howItWorks.artistsHeadingPrefix")}{" "}
              <span className="text-amber-500">{t("howItWorks.artistsHeadingHighlight")}</span>
            </h2>
            <p className="text-gray-600 mb-8">
              {t("howItWorks.artistsSubtitle")}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/register?role=artist"
              className="inline-flex items-center gap-2 px-6 py-3 text-white bg-amber-500 rounded-lg hover:bg-white hover:text-amber-600 border border-transparent hover:border-amber-500 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium hover:scale-105"
            >
              {t("howItWorks.artistsApplyCta")}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Visual - Image of artist at work with hue + zoom hover effects */}
          <div className="relative">
            <div className="group aspect-square rounded-xl overflow-hidden shadow-xl cursor-pointer transition-shadow duration-300 hover:shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
                alt={t("howItWorks.artistsImageAlt")}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Amber hue overlay - matches icon color */}
              <div className="absolute inset-0 bg-amber-600/0 transition-all duration-300 group-hover:bg-amber-600/50" />
              {/* Centered Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Palette className="w-10 h-10 text-amber-600" />
                </div>
              </div>
              {/* Bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Palette className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t("howItWorks.artistsCardTitle")}</p>
                    <p className="text-sm text-gray-600">{t("howItWorks.artistsCardSubtitle")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-teal-200 rounded-full opacity-50 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FOR BUYERS SECTION
   ============================================ */
function ForBuyersSection() {
  const { t } = useTranslation();
  const steps = [
    {
      icon: Search,
      title: t("howItWorks.buyerStep1Title"),
      description: t("howItWorks.buyerStep1Desc"),
    },
    {
      icon: Heart,
      title: t("howItWorks.buyerStep2Title"),
      description: t("howItWorks.buyerStep2Desc"),
    },
    {
      icon: Gift,
      title: t("howItWorks.buyerStep3Title"),
      description: t("howItWorks.buyerStep3Desc"),
    },
    {
      icon: Truck,
      title: t("howItWorks.buyerStep4Title"),
      description: t("howItWorks.buyerStep4Desc"),
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual - Image of art shopping/gallery with hue + zoom hover effects */}
          <div className="relative order-2 lg:order-1">
            <div className="group aspect-square rounded-xl overflow-hidden shadow-xl cursor-pointer transition-shadow duration-300 hover:shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1577720643272-265f09367456?w=800&q=80"
                alt={t("howItWorks.buyersImageAlt")}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Teal hue overlay - matches icon color */}
              <div className="absolute inset-0 bg-teal-600/0 transition-all duration-300 group-hover:bg-teal-600/50" />
              {/* Centered Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-10 h-10 text-teal-600" />
                </div>
              </div>
              {/* Bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t("howItWorks.buyersCardTitle")}</p>
                    <p className="text-sm text-gray-600">{t("howItWorks.buyersCardSubtitle")}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-amber-200 rounded-full opacity-50 -z-10" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
              {t("howItWorks.buyersLabel")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              {t("howItWorks.buyersHeadingPrefix")} <span className="text-teal-600">{t("howItWorks.buyersHeadingHighlight")}</span>
            </h2>
            <p className="text-gray-600 mb-8">
              {t("howItWorks.buyersSubtitle")}
            </p>

            <div className="space-y-4 mb-8">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-teal-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 text-white bg-teal-600 rounded-lg hover:bg-white hover:text-teal-600 border border-transparent hover:border-teal-600 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium hover:scale-105"
            >
              {t("howItWorks.buyersExploreCta")}
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   WASTE TO DISCOUNT SECTION
   ============================================ */
function WasteToDiscountSection() {
  const { t } = useTranslation();
  const tiers = [
    { weight: "1-2kg", discount: "5%", popular: false },
    { weight: "3-5kg", discount: "10%", popular: true },
    { weight: "6-10kg", discount: "15%", popular: false },
    { weight: t("howItWorks.wasteTierAbove10kg"), discount: "20%", popular: false },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
            <HandHeart className="w-4 h-4" />
            <span>{t("howItWorks.wasteBadge")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("howItWorks.wasteHeading")}
          </h2>
          <p className="text-teal-100">
            {t("howItWorks.wasteSubtitle")}
          </p>
        </div>

        {/* Discount Tiers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-xl text-center ${
                tier.popular
                  ? "bg-white text-gray-900"
                  : "bg-white/10 backdrop-blur-sm"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                  {t("howItWorks.wasteBestSeller")}
                </span>
              )}
              <p
                className={`text-sm font-medium mb-2 ${
                  tier.popular ? "text-gray-600" : "text-teal-200"
                }`}
              >
                {t("howItWorks.wasteGiveAway")}
              </p>
              <p
                className={`text-2xl font-bold mb-2 ${
                  tier.popular ? "text-gray-900" : "text-white"
                }`}
              >
                {tier.weight}
              </p>
              <p
                className={`text-4xl font-bold ${
                  tier.popular ? "text-teal-600" : "text-teal-300"
                }`}
              >
                {tier.discount}
              </p>
              <p
                className={`text-sm mt-1 ${
                  tier.popular ? "text-gray-600" : "text-teal-200"
                }`}
              >
                {t("howItWorks.wasteDiscountLabel")}
              </p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <h3 className="text-xl font-bold mb-6 text-center">{t("howItWorks.wasteHowHeading")}</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">1</span>
              </div>
              <p className="font-medium">{t("howItWorks.wasteHowStep1Title")}</p>
              <p className="text-sm text-teal-200 mt-1">
                {t("howItWorks.wasteHowStep1Desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">2</span>
              </div>
              <p className="font-medium">{t("howItWorks.wasteHowStep2Title")}</p>
              <p className="text-sm text-teal-200 mt-1">
                {t("howItWorks.wasteHowStep2Desc")}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">3</span>
              </div>
              <p className="font-medium">{t("howItWorks.wasteHowStep3Title")}</p>
              <p className="text-sm text-teal-200 mt-1">
                {t("howItWorks.wasteHowStep3Desc")}
              </p>
            </div>
          </div>
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
    { name: t("howItWorks.materialAccepted1"), icon: GlassWater },
    { name: t("howItWorks.materialAccepted2"), icon: CircleDot },
    { name: t("howItWorks.materialAccepted3"), icon: Package },
    { name: t("howItWorks.materialAccepted4"), icon: FileText },
    { name: t("howItWorks.materialAccepted5"), icon: Scissors },
    { name: t("howItWorks.materialAccepted6"), icon: Shirt },
    { name: t("howItWorks.materialAccepted7"), icon: Container },
  ];

  const notAccepted = [
    { name: t("howItWorks.materialRejected1"), icon: AlertTriangle },
    { name: t("howItWorks.materialRejected2"), icon: Biohazard },
    { name: t("howItWorks.materialRejected3"), icon: AlertOctagon },
    { name: t("howItWorks.materialRejected4"), icon: FlaskConical },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
            {t("howItWorks.materialsLabel")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            {t("howItWorks.materialsHeading")}
          </h2>
          <p className="text-gray-600">
            {t("howItWorks.materialsSubtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Accepted */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {t("howItWorks.materialsAcceptedHeading")}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {acceptedMaterials.map((material, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <material.icon className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {material.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Not Accepted */}
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {t("howItWorks.materialsRejectedHeading")}
              </h3>
            </div>

            <div className="space-y-3">
              {notAccepted.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-red-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-gray-500">
              {t("howItWorks.materialsSafetyNote")}
            </p>
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
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {t("howItWorks.ctaHeading")}
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {t("howItWorks.ctaSubtitle")}
        </p>

        <div className="group flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white bg-teal-600 rounded-lg group-hover:bg-white group-hover:text-teal-600 border border-transparent group-hover:border-teal-600 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium shadow-lg shadow-teal-600/30 text-lg group-hover:scale-105"
          >
            {t("howItWorks.ctaGetStarted")}
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-teal-700 bg-teal-100 rounded-lg group-hover:bg-teal-600 group-hover:text-white [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium text-lg group-hover:scale-105"
          >
            {t("howItWorks.ctaContact")}
          </a>
        </div>
      </div>
    </section>
  );
}

