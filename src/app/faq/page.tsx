"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ShoppingBag,
  Palette,
  Truck,
  CreditCard,
  Shield,
  Recycle,
  HelpCircle,
  MessageCircle,
  Mail,
} from "lucide-react";

const faqCategories = [
  { id: "general", label: "General", icon: HelpCircle },
  { id: "buying", label: "Buying", icon: ShoppingBag },
  { id: "selling", label: "Selling", icon: Palette },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "sustainability", label: "Sustainability", icon: Recycle },
];

const faqs = [
  {
    category: "general",
    question: "What is RenewCanvas Africa?",
    answer:
      "RenewCanvas Africa is a circular economy marketplace connecting talented African artists who create sustainable art from recycled and upcycled materials with conscious buyers worldwide. Our platform promotes environmental sustainability while supporting African artists and preserving cultural heritage.",
  },
  {
    category: "general",
    question: "How does RenewCanvas Africa ensure artwork authenticity?",
    answer:
      "Every artist on our platform goes through a verification process where we review their portfolio, verify their identity, and assess the sustainability of their materials and practices. Each artwork comes with a certificate of authenticity and detailed information about the materials used and their environmental impact.",
  },
  {
    category: "general",
    question: "What countries does RenewCanvas Africa operate in?",
    answer:
      "We currently work with artists from 12 African countries including Rwanda, Kenya, Uganda, Tanzania, Nigeria, Ghana, South Africa, Ethiopia, Senegal, Morocco, Egypt, and Ivory Coast. We ship artwork to customers worldwide.",
  },
  {
    category: "buying",
    question: "How do I purchase artwork?",
    answer:
      "Simply browse our marketplace, find artwork you love, and proceed to checkout. Buyers pay RenewCanvas Africa directly, then RenewCanvas confirms the order, coordinates fulfillment with the artist, and manages delivery communication.",
  },
  {
    category: "buying",
    question: "Can I request custom artwork?",
    answer:
      "Yes. Many artists accept custom commissions, but requests are coordinated through RenewCanvas admins. We collect the brief, confirm scope and pricing, and keep buyer and artist contact details private.",
  },
  {
    category: "buying",
    question: "How do I track my order?",
    answer:
      "Once your order is shipped, you'll receive an email with tracking information. You can also track your order status by logging into your account and visiting the 'My Orders' section in your dashboard.",
  },
  {
    category: "buying",
    question: "What if I receive damaged artwork?",
    answer:
      "If your artwork arrives damaged, please contact RenewCanvas within 48 hours of delivery with photos of the damage. Admins will review the issue and coordinate any approved replacement, return, or refund.",
  },
  {
    category: "selling",
    question: "How do I become an artist on RenewCanvas Africa?",
    answer:
      "To join as an artist, click 'Join as Artist' and complete the registration process. You'll need to submit your portfolio, provide information about your artistic practice and materials, and go through our verification process. Once approved, you can start listing your artwork.",
  },
  {
    category: "selling",
    question: "What percentage of sales do artists keep?",
    answer:
      "Artists keep 80% of every eligible sale made on RenewCanvas Africa. Buyers pay RenewCanvas first, and artist payouts are released by admins after delivery and the 48-hour return request window.",
  },
  {
    category: "selling",
    question: "How does the AI-powered pricing work?",
    answer:
      "Our AI pricing assistant analyzes various factors including material costs, artwork dimensions, complexity, artist experience, and market trends to suggest optimal pricing. You can use this as a starting point and adjust based on your preferences.",
  },
  {
    category: "selling",
    question: "How long does artist verification take?",
    answer:
      "Artist verification typically takes 3-5 business days. During this time, our team reviews your portfolio, verifies your identity, and assesses your sustainability practices. You'll receive an email notification once your account is approved.",
  },
  {
    category: "shipping",
    question: "How is artwork shipped?",
    answer:
      "Artists are responsible for packaging and shipping their artwork. We provide guidelines for proper packaging to ensure artwork arrives safely. Shipping costs are calculated based on the artwork size, weight, and destination.",
  },
  {
    category: "shipping",
    question: "How long does shipping take?",
    answer:
      "Shipping times vary depending on the origin and destination. Domestic orders typically arrive within 3-7 business days, while international orders may take 2-4 weeks. Express shipping options are available for faster delivery.",
  },
  {
    category: "shipping",
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to most countries worldwide. International shipping costs and delivery times vary based on the destination. Some artwork may have shipping restrictions due to size or materials.",
  },
  {
    category: "payments",
    question: "What payment methods do you accept?",
    answer:
      "We accept major credit cards, bank transfers, and MTN MoMo phone approval prompts, with USSD available as a fallback when prompts are unavailable. Buyers pay RenewCanvas Africa directly, and payment processing is secure and encrypted to protect financial information.",
  },
  {
    category: "payments",
    question: "When do artists receive payment?",
    answer:
      "Artists receive payment within 7 days after the buyer confirms delivery or 14 days after the tracking shows delivery (whichever comes first). Payments are made via bank transfer or mobile money to the artist's preferred account.",
  },
  {
    category: "payments",
    question: "Is my payment information secure?",
    answer:
      "Yes, we use industry-standard SSL encryption and partner with trusted payment processors to ensure your financial information is always protected. We never store your complete credit card details on our servers.",
  },
  {
    category: "sustainability",
    question: "How do you verify that artwork is made from recycled materials?",
    answer:
      "Artists must document the materials used in each artwork, including photos of the raw materials before transformation. Our team reviews this documentation, and we may request additional verification for high-value pieces.",
  },
  {
    category: "sustainability",
    question: "How is environmental impact calculated?",
    answer:
      "We calculate environmental impact based on the weight and type of recycled materials used in each artwork. This includes an estimate of the waste diverted from landfills and the equivalent carbon emissions saved compared to using virgin materials.",
  },
  {
    category: "sustainability",
    question: "What types of recycled materials do artists use?",
    answer:
      "Our artists use a wide variety of recycled and upcycled materials including reclaimed wood, metal scraps, plastic bottles, electronic waste, fabric remnants, paper, glass, rubber tires, and agricultural waste like banana fiber and coffee husks.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openQuestions, setOpenQuestions] = useState<number[]>([0]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleQuestion = (index: number) => {
    setOpenQuestions((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-teal-100 mb-8">
            Find answers to common questions about RenewCanvas Africa
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 gap-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === "all"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Topics
            </button>
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category.id
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or browse a different category
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-teal-200 transition-colors"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-medium text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    {openQuestions.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openQuestions.includes(index) && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-8">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Contact Support
            </Link>
            <a
              href="mailto:hello.renewcanvas.africa@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-teal-600 border border-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Email Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
