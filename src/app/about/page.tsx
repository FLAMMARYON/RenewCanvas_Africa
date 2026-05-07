"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Recycle,
  Heart,
  Globe,
  Users,
  Target,
  Award,
  Leaf,
  ArrowRight,
  CheckCircle,
  Palette,
  TrendingUp,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const stats = [
  { value: "1,250+", label: "kg Waste Diverted", icon: Recycle },
  { value: "150+", label: "Local Artists", icon: Palette },
  { value: "500+", label: "Artworks Sold", icon: Heart },
  { value: "12", label: "African Countries", icon: Globe },
];

const values = [
  {
    icon: Recycle,
    title: "Sustainability First",
    description:
      "Every artwork on our platform is created from recycled or upcycled materials, turning waste into beauty.",
  },
  {
    icon: Users,
    title: "Artist Empowerment",
    description:
      "We ensure artists receive 80% of every sale, providing fair compensation for their creativity and craftsmanship.",
  },
  {
    icon: Globe,
    title: "African Heritage",
    description:
      "We celebrate and preserve African artistic traditions while promoting contemporary sustainable art practices.",
  },
  {
    icon: Target,
    title: "Impact Transparency",
    description:
      "Every artwork tracks its environmental impact, showing exactly how much waste was diverted from landfills.",
  },
];

const team = [
  {
    name: "Amara Nzeyimana",
    role: "Founder & CEO",
    bio: "Environmental activist and entrepreneur passionate about circular economy solutions in Africa.",
  },
  {
    name: "David Mugisha",
    role: "Head of Artist Relations",
    bio: "Former gallery curator dedicated to supporting African artists and their sustainable art practices.",
  },
  {
    name: "Grace Uwera",
    role: "Head of Operations",
    bio: "Operations expert with 10 years of experience in e-commerce and logistics across East Africa.",
  },
  {
    name: "Jean-Pierre Habimana",
    role: "Technology Lead",
    bio: "Tech innovator building digital solutions that connect artists with global audiences.",
  },
];

const milestones = [
  { year: "2024", event: "RenewCanvas Africa founded in Kigali, Rwanda" },
  { year: "2024", event: "First 50 artists onboarded to the platform" },
  { year: "2025", event: "Reached 500kg of waste diverted through art" },
  { year: "2025", event: "Expanded to 5 East African countries" },
  { year: "2026", event: "Launched AI-powered pricing for artists" },
  { year: "2026", event: "Surpassed 1,000kg waste diverted milestone" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Transforming Waste into
            <span className="text-amber-400"> African Art</span>
          </h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
            RenewCanvas Africa is a circular economy marketplace connecting
            talented African artists who create sustainable art from recycled
            materials with conscious buyers worldwide.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/marketplace"
              className="px-8 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors"
            >
              Explore Artworks
            </Link>
            <Link
              href="/register?role=artist"
              className="px-8 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              Join as Artist
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-100 rounded-full mb-4">
                  <stat.icon className="w-7 h-7 text-teal-600" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  RenewCanvas Africa was born from a simple observation: across
                  Africa, talented artists were creating incredible works of art
                  from discarded materials, yet they lacked access to markets
                  that valued both their artistry and environmental impact.
                </p>
                <p>
                  Founded in 2024 in Kigali, Rwanda, we set out to build a
                  platform that would change this narrative. Our mission is to
                  create a thriving marketplace where sustainability meets
                  creativity, where waste becomes wonder, and where African
                  artists can earn a fair income while making a positive
                  environmental impact.
                </p>
                <p>
                  Today, we work with over 150 artists across Africa, helping
                  them reach customers who appreciate the dual value of their
                  work: exceptional artistry and meaningful environmental action.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-teal-100 to-amber-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Recycle className="w-24 h-24 text-teal-400 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-teal-700">
                    Art from Recycled Materials
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-amber-400 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at RenewCanvas Africa
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-8 text-white">
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-teal-100">
                To empower African artists by providing a global marketplace for
                sustainable art, while driving environmental impact through the
                creative reuse of waste materials.
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-8 text-white">
              <div className="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mb-6">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-amber-100">
                A world where art and sustainability are inseparable, where every
                piece of waste is seen as an opportunity for creativity, and
                where African artists lead the global circular economy movement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600">Key milestones in our story</p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-teal-200" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`w-5/12 ${
                      index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"
                    }`}
                  >
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <span className="text-sm font-bold text-teal-600">
                        {milestone.year}
                      </span>
                      <p className="text-gray-700">{milestone.event}</p>
                    </div>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-teal-600 rounded-full border-4 border-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The passionate people behind RenewCanvas Africa
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-teal-100 to-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-teal-600">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-teal-600 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Join the Movement
          </h2>
          <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
            Whether you're an artist looking to showcase your sustainable
            creations or a buyer seeking meaningful art, we'd love to have you
            in our community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register?role=artist"
              className="px-8 py-3 bg-white text-teal-700 rounded-lg font-medium hover:bg-teal-50 transition-colors flex items-center gap-2"
            >
              <Palette className="w-5 h-5" />
              Join as Artist
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Start Collecting
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <MapPin className="w-6 h-6 mx-auto mb-3 text-teal-400" />
              <p className="font-medium">Kigali Innovation City</p>
              <p className="text-gray-400">Kigali, Rwanda</p>
            </div>
            <div>
              <Mail className="w-6 h-6 mx-auto mb-3 text-teal-400" />
              <p className="font-medium">hello.renewcanvas.africa@gmail.com</p>
              <p className="text-gray-400">We'd love to hear from you</p>
            </div>
            <div>
              <Phone className="w-6 h-6 mx-auto mb-3 text-teal-400" />
              <p className="font-medium">+250 788 000 000</p>
              <p className="text-gray-400">Mon-Fri, 9am-5pm EAT</p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2026 RenewCanvas <span className="text-amber-500">Africa</span>. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
