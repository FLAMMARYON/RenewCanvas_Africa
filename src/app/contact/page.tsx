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
  Link,
  Briefcase,
  Image,
  FileText,
  Globe,
  Truck,
} from "lucide-react";
import { useState } from "react";

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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Renew<span className="text-teal-600">Canvas</span> <span className="text-amber-500">Africa</span>
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
      details: ["hello.renewcanvas.africa@xxxx", "nicholaseke04@gmail.com"],
      color: "teal",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+250 XXX XXX XXX"],
      subtext: "Mon-Fri, 9am-5pm EAT",
      color: "purple",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: ["Kigali, Rwanda"],
      subtext: "By appointment only",
      color: "amber",
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: ["Monday - Friday", "9:00 AM - 5:00 PM EAT"],
      color: "green",
    },
  ];

  const colorClasses: Record<string, { bg: string; iconBg: string; icon: string; border: string }> = {
    teal: { bg: "bg-teal-50", iconBg: "bg-teal-100", icon: "text-teal-600", border: "border-teal-200" },
    purple: { bg: "bg-purple-50", iconBg: "bg-purple-100", icon: "text-purple-600", border: "border-purple-200" },
    amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", icon: "text-amber-600", border: "border-amber-200" },
    green: { bg: "bg-green-50", iconBg: "bg-green-100", icon: "text-green-600", border: "border-green-200" },
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => {
            const colors = colorClasses[info.color];
            return (
              <div
                key={index}
                className={`${colors.bg} border ${colors.border} rounded-2xl p-6 text-center hover:shadow-lg [transition:all_0.3s_ease] hover:-translate-y-1`}
              >
                <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <info.icon className={`w-8 h-8 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-gray-700 font-medium">
                    {detail}
                  </p>
                ))}
                {info.subtext && (
                  <p className="text-sm text-gray-500 mt-2">{info.subtext}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Social Links */}
        <div className="mt-12 text-center">
          <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
          <p className="text-gray-500 text-sm">Social media links coming soon.</p>
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
          <form className="space-y-6">
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
                      Your Name
                    </label>
                    <input type="text" id="name" name="name" placeholder="John Doe" className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input type="email" id="email" name="email" placeholder="john@example.com" className={inputClasses} />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input type="text" id="subject" name="subject" placeholder="How can we help?" className={inputClasses} />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea id="message" name="message" rows={5} placeholder="Tell us more about your inquiry..." className={`${inputClasses} resize-none`} />
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
                    <label htmlFor="artistName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input type="text" id="artistName" name="artistName" placeholder="Your full name" className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="artistEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input type="email" id="artistEmail" name="artistEmail" placeholder="artist@example.com" className={inputClasses} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input type="tel" id="phone" name="phone" placeholder="+250 XXX XXX XXX" className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location / City
                    </label>
                    <input type="text" id="location" name="location" placeholder="Kigali, Rwanda" className={inputClasses} />
                  </div>
                </div>

                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
                    <Link className="w-4 h-4 inline mr-1" />
                    Portfolio Link (Website, Instagram, etc.)
                  </label>
                  <input type="url" id="portfolio" name="portfolio" placeholder="https://your-portfolio.com" className={inputClasses} />
                </div>

                <div>
                  <label htmlFor="artStyle" className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" />
                    Art Style / Medium
                  </label>
                  <input type="text" id="artStyle" name="artStyle" placeholder="e.g., Sculpture, Painting, Mixed Media, Textile Art" className={inputClasses} />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience with Recycled Materials
                  </label>
                  <select id="experience" name="experience" className={inputClasses}>
                    <option value="">Select your experience level</option>
                    <option value="beginner">Beginner - New to upcycled art</option>
                    <option value="intermediate">Intermediate - Some experience</option>
                    <option value="experienced">Experienced - Regular upcycled art creator</option>
                    <option value="professional">Professional - Full-time artist</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="artistBio" className="block text-sm font-medium text-gray-700 mb-2">
                    Tell Us About Yourself
                  </label>
                  <textarea id="artistBio" name="artistBio" rows={4} placeholder="Share your artistic journey, inspiration, and why you want to join RenewCanvas..." className={`${inputClasses} resize-none`} />
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
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person
                    </label>
                    <input type="text" id="contactName" name="contactName" placeholder="Your full name" className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Email
                    </label>
                    <input type="email" id="contactEmail" name="contactEmail" placeholder="contact@company.com" className={inputClasses} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Organization / Company
                    </label>
                    <input type="text" id="organization" name="organization" placeholder="Company name" className={inputClasses} />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Website
                    </label>
                    <input type="url" id="website" name="website" placeholder="https://company.com" className={inputClasses} />
                  </div>
                </div>

                <div>
                  <label htmlFor="partnershipType" className="block text-sm font-medium text-gray-700 mb-2">
                    Partnership Type
                  </label>
                  <select id="partnershipType" name="partnershipType" className={inputClasses}>
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
                  <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Partnership Proposal
                  </label>
                  <textarea id="proposal" name="proposal" rows={5} placeholder="Describe your partnership idea, what you hope to achieve, and how we can work together..." className={`${inputClasses} resize-none`} />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={`inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-white rounded-xl [transition:all_0.4s_ease] font-medium hover:scale-[1.02] shadow-lg ${
                selectedInquiry === "general"
                  ? "bg-teal-600 hover:bg-teal-700 shadow-teal-600/30"
                  : selectedInquiry === "artist"
                  ? "bg-purple-600 hover:bg-purple-700 shadow-purple-600/30"
                  : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
              }`}
            >
              {selectedInquiry === "artist" ? "Submit Application" : selectedInquiry === "partnership" ? "Submit Proposal" : "Send Message"}
              <Send className="w-5 h-5" />
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
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Renew<span className="text-teal-400">Canvas</span> <span className="text-amber-500">Africa</span>
              </span>
            </a>
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
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} RenewCanvas <span className="text-amber-500">Africa</span>. All rights reserved.
          </p>
          <span className="hidden sm:inline text-gray-600">|</span>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Leaf className="w-4 h-4 text-teal-500" />
            <span>Built for a sustainable future</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
