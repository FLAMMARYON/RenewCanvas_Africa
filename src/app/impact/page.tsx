"use client";

import {
  Recycle,
  Palette,
  TrendingUp,
  ArrowRight,
  Leaf,
  Users,
  Award,
  Globe,
  Wind,
  DollarSign,
  Target,
  BarChart3,
  Truck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

interface PlatformMetrics {
  kgDiverted: number;
  co2SavedKg: number;
  treesEquivalent: number;
  waterSavedLitres: number;
  artistCount: number;
  artworkCount: number;
  artistIncomeRwf: number;
  lastUpdated: string;
}

export default function ImpactPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metrics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setMetrics(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Key Metrics Section */}
      <KeyMetricsSection metrics={metrics} loading={loading} />

      {/* Environmental Impact */}
      <EnvironmentalImpactSection metrics={metrics} loading={loading} />

      {/* Impact Stories - Commented out until we have real stories */}
      {/* <ImpactStoriesSection /> */}

      {/* Goals Section */}
      <GoalsSection />

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
      <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <BarChart3 className="w-4 h-4" />
            <span>{t("impact.heroBadge")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            {t("impact.heroTitlePrefix")} <span className="text-amber-400">{t("impact.heroTitleHighlight")}</span>
          </h1>

          <p className="text-lg text-teal-100 mb-8">
            {t("impact.heroSubtitle")}
          </p>

          <div className="group flex flex-wrap justify-center gap-4">
            <a
              href="#metrics"
              className="inline-flex items-center gap-2 px-6 py-3 text-teal-700 bg-white rounded-lg group-hover:bg-teal-600 group-hover:text-white [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium group-hover:scale-105"
            >
              {t("impact.heroCtaPrimary")}
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 text-white border-2 border-white/50 rounded-lg group-hover:bg-white group-hover:text-teal-700 group-hover:border-white [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium group-hover:scale-105"
            >
              {t("impact.heroCtaSecondary")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   KEY METRICS SECTION
   ============================================ */
function KeyMetricsSection({
  metrics,
  loading,
}: {
  metrics: PlatformMetrics | null;
  loading: boolean;
}) {
  const { t } = useTranslation();
  // Format metric value - show "-" for zero/null, otherwise format nicely
  const formatValue = (value: number | undefined): string => {
    if (loading) return "...";
    if (!value || value === 0) return "-";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const formatRwf = (value: number | undefined): string => {
    if (loading) return "...";
    if (!value || value === 0) return "-";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M RWF`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K RWF`;
    return `${value.toLocaleString()} RWF`;
  };

  const metricsList = [
    {
      value: formatValue(metrics?.kgDiverted),
      label: t("impact.metricKgDivertedLabel"),
      description: t("impact.metricKgDivertedDesc"),
      icon: Recycle,
      color: "teal",
    },
    {
      value: formatValue(metrics?.artistCount),
      label: t("impact.metricArtistsLabel"),
      description: t("impact.metricArtistsDesc"),
      icon: Users,
      color: "amber",
    },
    {
      value: formatValue(metrics?.artworkCount),
      label: t("impact.metricArtworksLabel"),
      description: t("impact.metricArtworksDesc"),
      icon: Palette,
      color: "purple",
    },
    {
      value: formatRwf(metrics?.artistIncomeRwf),
      label: t("impact.metricEarningsLabel"),
      description: t("impact.metricEarningsDesc"),
      icon: DollarSign,
      color: "green",
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; light: string }> = {
    teal: { bg: "bg-teal-600", text: "text-teal-600", light: "bg-teal-100" },
    amber: { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-100" },
    purple: { bg: "bg-purple-600", text: "text-purple-600", light: "bg-purple-100" },
    green: { bg: "bg-green-600", text: "text-green-600", light: "bg-green-100" },
  };

  return (
    <section id="metrics" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
            {t("impact.keyMetricsEyebrow")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            {t("impact.keyMetricsTitle")}
          </h2>
          <p className="text-gray-600">
            {t("impact.keyMetricsSubtitle")}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricsList.map((metric, index) => {
            const colors = colorClasses[metric.color];
            return (
              <div
                key={index}
                className="group relative bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] hover:scale-105 cursor-pointer"
              >
                {/* Icon */}
                <div className={`w-14 h-14 ${colors.light} rounded-xl flex items-center justify-center mb-4`}>
                  <metric.icon className={`w-7 h-7 ${colors.text}`} />
                </div>

                {/* Value */}
                <p className={`text-4xl font-bold ${colors.text} mb-2`}>
                  {metric.value}
                </p>

                {/* Label */}
                <p className="font-semibold text-gray-900 mb-1">
                  {metric.label}
                </p>

                {/* Description */}
                <p className="text-sm text-gray-500">
                  {metric.description}
                </p>

                {/* Hover accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${colors.bg} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   ENVIRONMENTAL IMPACT SECTION
   ============================================ */
function EnvironmentalImpactSection({
  metrics,
  loading,
}: {
  metrics: PlatformMetrics | null;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const formatValue = (value: number | undefined): string => {
    if (loading) return "...";
    if (!value || value === 0) return "-";
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const impacts = [
    {
      icon: Wind,
      value: formatValue(metrics?.co2SavedKg),
      label: t("impact.co2Label"),
      description: t("impact.co2Desc"),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">
              {t("impact.envEyebrow")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              {t("impact.envTitlePrefix")} <span className="text-green-600">{t("impact.envTitleHighlight")}</span>
            </h2>
            <p className="text-gray-600 mb-8">
              {t("impact.envSubtitle")}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {impacts.map((impact, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] hover:scale-105 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <impact.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{impact.value}</p>
                      <p className="text-sm font-medium text-gray-700">{impact.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{impact.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="group aspect-square rounded-xl overflow-hidden shadow-xl cursor-pointer transition-shadow duration-300 hover:shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80"
                alt={t("impact.envImageAlt")}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Green hue overlay */}
              <div className="absolute inset-0 bg-green-600/0 transition-all duration-300 group-hover:bg-green-600/40" />
              {/* Centered Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-10 h-10 text-green-600" />
                </div>
              </div>
              {/* Bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t("impact.zeroWasteTitle")}</p>
                    <p className="text-sm text-gray-600">{t("impact.zeroWasteSubtitle")}</p>
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
   IMPACT STORIES SECTION
   ============================================ */
function ImpactStoriesSection() {
  const stories = [
    {
      name: "Amara K.",
      role: "Visual Artist, Kigali",
      quote: "RenewCanvas gave me access to materials I could never afford. Now I create beautiful pieces and earn a living doing what I love.",
      image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
      impact: "15 artworks sold",
    },
    {
      name: "Jean-Paul M.",
      role: "Sculptor, Kigali",
      quote: "The training workshops taught me new techniques. My sculptures now sell internationally, and I have hired two assistants.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      impact: "25+ kg waste transformed",
    },
    {
      name: "Grace N.",
      role: "Jewelry Maker, Nairobi",
      quote: "I started as a hobbyist. RenewCanvas helped me turn my passion into a business. My jewelry is now in three boutiques.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      impact: "$1,200 earned",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
            Impact Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Voices of <span className="text-teal-600">Change</span>
          </h2>
          <p className="text-gray-600">
            Real stories from artists whose lives have been transformed through
            the RenewCanvas platform.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] hover:scale-105 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-teal-600/0 transition-all duration-300 group-hover:bg-teal-600/30" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">{story.name}</p>
                    <p className="text-sm text-gray-500">{story.role}</p>
                  </div>
                </div>

                <blockquote className="text-gray-600 italic mb-4">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>

                <div className="flex items-center gap-2 text-teal-600">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">{story.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   GOALS SECTION
   ============================================ */
function GoalsSection() {
  const { t } = useTranslation();
  const goals = [
    {
      target: "100 kg",
      current: "0 kg",
      percentage: 0,
      label: t("impact.goalWasteDiverted"),
    },
    {
      target: "100",
      current: "0",
      percentage: 0,
      label: t("impact.goalArtistsOnboarded"),
    },
    {
      target: "100",
      current: "0",
      percentage: 0,
      label: t("impact.goalArtworksCreated"),
    },
    {
      target: "$1,000",
      current: "$0",
      percentage: 0,
      label: t("impact.goalArtistEarnings"),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
            <Target className="w-4 h-4" />
            <span>{t("impact.goalsBadge")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {t("impact.goalsTitle")}
          </h2>
          <p className="text-teal-100">
            {t("impact.goalsSubtitle")}
          </p>
        </div>

        {/* Goals Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {goals.map((goal, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300"
            >
              <div className="mb-4">
                <p className="text-3xl font-bold">{goal.current}</p>
                <p className="text-sm text-teal-200">{t("impact.goalOfTarget", { target: goal.target })}</p>
              </div>

              <p className="font-medium mb-3">{goal.label}</p>

              {/* Progress bar */}
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                  style={{ width: `${goal.percentage}%` }}
                />
              </div>
              <p className="text-xs text-teal-200 mt-2">{t("impact.goalPercentAchieved", { percentage: goal.percentage })}</p>
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
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {t("impact.ctaTitle")}
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          {t("impact.ctaSubtitle")}
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
          <a
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white bg-teal-600 rounded-lg hover:bg-teal-700 [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium shadow-lg shadow-teal-600/30 text-lg hover:scale-105"
          >
            {t("impact.ctaShopButton")}
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/register?role=artist"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-teal-700 bg-teal-100 rounded-lg hover:bg-teal-600 hover:text-white [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium text-lg hover:scale-105"
          >
            {t("impact.ctaArtistButton")}
            <Palette className="w-5 h-5" />
          </a>
          <a
            href="/book-collection"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-500 hover:text-white [transition:all_0.4s_cubic-bezier(0.4,0,0.2,1)] font-medium text-lg hover:scale-105"
          >
            <Truck className="w-5 h-5" />
            {t("impact.ctaBookButton")}
          </a>
        </div>

      </div>
    </section>
  );
}

