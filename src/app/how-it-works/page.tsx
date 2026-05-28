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
  Award,
  Package,
  Sparkles,
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
  CreditCard,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

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
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-amber-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>The RenewCanvas Process</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            From <span className="text-teal-600">Waste</span> to{" "}
            <span className="text-amber-500">Masterpiece</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Discover how we transform discarded materials into stunning artwork
            while empowering African artists and creating measurable
            environmental impact.
          </p>

          <div className="group flex flex-wrap justify-center gap-4">
            <a
              href="#process"
              className="inline-flex items-center gap-2 px-6 py-3 text-white bg-teal-600 rounded-lg group-hover:bg-white group-hover:text-teal-600 border border-transparent group-hover:border-teal-600 [transition:all_0.4s_ease] font-medium group-hover:scale-105"
            >
              See the Process
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 text-teal-700 bg-white border-2 border-teal-200 rounded-lg group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 [transition:all_0.4s_ease] font-medium group-hover:scale-105"
            >
              Browse Artwork
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
  const steps = [
    {
      number: "01",
      icon: Recycle,
      title: "Material Collection",
      description:
        "We partner with waste pickers, recycling companies, schools, and businesses to collect specific recyclable materials. Each batch is documented with source information for full traceability.",
      details: [
        "Plastic bottles and caps",
        "Clean cardboard and paper",
        "Fabric scraps and textiles",
        "Non-hazardous metals",
      ],
      color: "teal",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80",
    },
    {
      number: "02",
      icon: ClipboardCheck,
      title: "Sorting & Cleaning",
      description:
        "All collected materials go through our rigorous cleaning and sorting process. We ensure only safe, sanitized materials reach our artists.",
      details: [
        "Quality inspection",
        "Sanitization process",
        "Material grading",
        "Batch documentation",
      ],
      color: "amber",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    },
    {
      number: "03",
      icon: Palette,
      title: "Artist Creation",
      description:
        "Our vetted artists receive cleaned materials and transform them into unique artwork. Each piece carries the story of its materials and creator.",
      details: [
        "Curated artist selection",
        "Material allocation",
        "Creative freedom",
        "Quality standards",
      ],
      color: "purple",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Impact Tracking",
      description:
        "Every artwork is logged with detailed impact metrics - kilograms of waste diverted, materials used, and artist earnings generated.",
      details: [
        "Waste weight tracking",
        "Material type logging",
        "Artist income records",
        "Environmental certificates",
      ],
      color: "rose",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    },
    {
      number: "05",
      icon: ShoppingBag,
      title: "Marketplace Listing",
      description:
        "Approved artworks are listed on our marketplace with full impact stories, high-quality images, and transparent pricing.",
      details: [
        "Professional photography",
        "Impact story creation",
        "Fair pricing guidance",
        "Category organization",
      ],
      color: "blue",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
    },
    {
      number: "06",
      icon: Heart,
      title: "Buyer Connection",
      description:
        "Buyers discover and purchase unique, impact-verified artwork. Each sale supports artists directly and funds further waste collection.",
      details: [
        "Secure payments",
        "Careful packaging",
        "Impact certificates",
        "Artist support",
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
            Our Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            Six Steps to Sustainable Art
          </h2>
          <p className="text-gray-600">
            A transparent, traceable journey from discarded materials to
            cherished artwork in your space.
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
                        Have recyclable materials? Contribute to sustainability and earn discounts!
                      </p>
                      <a
                        href="/book-collection"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 [transition:all_0.3s_ease] text-sm"
                      >
                        <Truck className="w-4 h-4" />
                        Book a Collection
                      </a>
                    </div>
                  )}
                </div>

                {/* Visual - Image with hue + zoom hover effects */}
                <div className="flex-1 w-full">
                  <div className="group relative aspect-video rounded-2xl overflow-hidden shadow-lg cursor-pointer transition-shadow duration-300 hover:shadow-2xl">
                    {/* Background Image with zoom effect */}
                    <img
                      src={step.image}
                      alt={step.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Color Hue Overlay - matches icon color, appears on hover */}
                    <div className={`absolute inset-0 ${colors.hue} ${colors.hueHover} transition-all duration-300`} />
                    {/* Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
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
  const benefits = [
    {
      icon: Package,
      title: "Quality Materials",
      description: "Receive cleaned, sorted recyclable materials ready for creation",
    },
    {
      icon: Users,
      title: "Visibility & Exposure",
      description: "Get featured on our platform with professional profiles",
    },
    {
      icon: TrendingUp,
      title: "Fair Earnings",
      description: "Keep 75-80% of each sale with transparent commission",
    },
    {
      icon: Award,
      title: "Training & Support",
      description: "Access upcycling workshops and creative resources",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">
              For Artists
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              Turn Your Talent Into{" "}
              <span className="text-amber-500">Sustainable Income</span>
            </h2>
            <p className="text-gray-600 mb-8">
              Join our curated community of artists creating impact through
              upcycled art. We provide the materials, platform, and support—you
              bring the creativity.
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
              className="inline-flex items-center gap-2 px-6 py-3 text-white bg-amber-500 rounded-lg hover:bg-white hover:text-amber-600 border border-transparent hover:border-amber-500 [transition:all_0.4s_ease] font-medium hover:scale-105"
            >
              Apply as Artist
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Visual - Image of artist at work with hue + zoom hover effects */}
          <div className="relative">
            <div className="group aspect-square rounded-3xl overflow-hidden shadow-xl cursor-pointer transition-shadow duration-300 hover:shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
                alt="Artist creating artwork"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Amber hue overlay - matches icon color */}
              <div className="absolute inset-0 bg-amber-600/0 transition-all duration-300 group-hover:bg-amber-600/50" />
              {/* Centered Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
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
                    <p className="font-semibold text-gray-900">Create with Purpose</p>
                    <p className="text-sm text-gray-600">Every artwork tells a story</p>
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
  const steps = [
    {
      icon: Search,
      title: "Browse & Discover",
      description: "Explore our curated collection of unique, impact-verified artwork",
    },
    {
      icon: Heart,
      title: "Choose Your Piece",
      description: "Find artwork that speaks to you and read its impact story",
    },
    {
      icon: Gift,
      title: "Give Waste, Get Discount",
      description: "Contribute recyclable materials and receive discounts on your purchase",
    },
    {
      icon: CreditCard,
      title: "Secure Checkout",
      description: "Pay securely with card, bank transfer, or mobile payment",
    },
    {
      icon: Truck,
      title: "Receive & Enjoy",
      description: "Get your artwork with impact certificate and care instructions",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual - Image of art shopping/gallery with hue + zoom hover effects */}
          <div className="relative order-2 lg:order-1">
            <div className="group aspect-square rounded-3xl overflow-hidden shadow-xl cursor-pointer transition-shadow duration-300 hover:shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1577720643272-265f09367456?w=800&q=80"
                alt="Art gallery display"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Teal hue overlay - matches icon color */}
              <div className="absolute inset-0 bg-teal-600/0 transition-all duration-300 group-hover:bg-teal-600/50" />
              {/* Centered Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
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
                    <p className="font-semibold text-gray-900">Shop with Impact</p>
                    <p className="text-sm text-gray-600">Every purchase makes a difference</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-amber-200 rounded-full opacity-50 -z-10" />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
              For Buyers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-6">
              Art That <span className="text-teal-600">Tells a Story</span>
            </h2>
            <p className="text-gray-600 mb-8">
              Every piece on RenewCanvas Africa comes with verified impact
              metrics. Know exactly how much waste was diverted and which artist
              you are supporting.
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
              className="inline-flex items-center gap-2 px-6 py-3 text-white bg-teal-600 rounded-lg hover:bg-white hover:text-teal-600 border border-transparent hover:border-teal-600 [transition:all_0.4s_ease] font-medium hover:scale-105"
            >
              Explore Marketplace
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
  const tiers = [
    { weight: "1-2kg", discount: "5%", popular: false },
    { weight: "3-5kg", discount: "10%", popular: true },
    { weight: "6-10kg", discount: "15%", popular: false },
    { weight: "Above 10kg", discount: "20%", popular: false },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6">
            <HandHeart className="w-4 h-4" />
            <span>Waste-to-Discount Program</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Give Away Waste, Get Discounts
          </h2>
          <p className="text-teal-100">
            Bring us your waste materials and get discounts on art purchases.
            The more you give away, the greater the discount you receive.
          </p>
        </div>

        {/* Discount Tiers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl text-center ${
                tier.popular
                  ? "bg-white text-gray-900"
                  : "bg-white/10 backdrop-blur-sm"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                  Best Seller
                </span>
              )}
              <p
                className={`text-sm font-medium mb-2 ${
                  tier.popular ? "text-gray-600" : "text-teal-200"
                }`}
              >
                Give Away
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
                discount
              </p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-center">How Does It Work?</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">1</span>
              </div>
              <p className="font-medium">Collect Waste Materials</p>
              <p className="text-sm text-teal-200 mt-1">
                Gather waste materials at home or at the office
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">2</span>
              </div>
              <p className="font-medium">Request Pick-Up</p>
              <p className="text-sm text-teal-200 mt-1">
                Schedule pick-up or deliver to our collection points
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold">3</span>
              </div>
              <p className="font-medium">Get Your Discount</p>
              <p className="text-sm text-teal-200 mt-1">
                Receive a code and use it while making a purchase
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
  const acceptedMaterials = [
    { name: "Plastic Bottles (PET)", icon: GlassWater },
    { name: "Plastic Bottle Caps", icon: CircleDot },
    { name: "Cardboard Boxes", icon: Package },
    { name: "Paper Waste", icon: FileText },
    { name: "Fabric Scraps", icon: Scissors },
    { name: "Old Clothes", icon: Shirt },
    { name: "Aluminum Cans", icon: Container },
  ];

  const notAccepted = [
    { name: "Hazardous waste", icon: AlertTriangle },
    { name: "Bio-medical waste", icon: Biohazard },
    { name: "Sharp metal scraps", icon: AlertOctagon },
    { name: "Chemically treated materials", icon: FlaskConical },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
            Waste Materials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">
            What We Accept
          </h2>
          <p className="text-gray-600">
            We only recycle selected types of waste materials that can be
            effectively transformed into art.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Accepted */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Recyclable Waste Materials
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
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Unacceptable Materials
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
              For safety reasons, we cannot accept hazardous or contaminated
              materials. All materials must be clean and dry.
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
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Ready to Be Part of the Change?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Whether you are an artist looking to create, a buyer seeking unique art,
          or a partner wanting to contribute—join the RenewCanvas movement today.
        </p>

        <div className="group flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white bg-teal-600 rounded-lg group-hover:bg-white group-hover:text-teal-600 border border-transparent group-hover:border-teal-600 [transition:all_0.4s_ease] font-medium shadow-lg shadow-teal-600/30 text-lg group-hover:scale-105"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-teal-700 bg-teal-100 rounded-lg group-hover:bg-teal-600 group-hover:text-white [transition:all_0.4s_ease] font-medium text-lg group-hover:scale-105"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}

