"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Recycle,
  MapPin,
  Calendar,
  Award,
  Heart,
  Eye,
  ShoppingBag,
  Camera,
  MessageCircle,
  Globe,
  Mail,
  Share2,
  CheckCircle,
  Palette,
  ArrowRight,
  Star,
} from "lucide-react";
import { useParams } from "next/navigation";

// Mock artist data
const artistData = {
  id: "1",
  name: "Marie Uwimana",
  bio: "I am a passionate artist from Kigali, Rwanda, dedicated to transforming waste materials into beautiful, meaningful art pieces. My work explores the intersection of environmental sustainability and African cultural heritage. Through my art, I aim to show that beauty can emerge from what society discards, creating pieces that tell stories of transformation and hope.",
  location: "Kigali, Rwanda",
  joinedAt: "January 2025",
  isVerified: true,
  profileImage: null,
  coverImage: null,
  specialties: ["Sculpture", "Mixed Media", "Wall Art"],
  preferredMaterials: ["PET Bottles", "Fabric Scraps", "Metal Cans"],
  stats: {
    artworks: 12,
    sales: 8,
    views: 4892,
    followers: 156,
    kgDiverted: 28.5,
  },
  social: {
    instagram: "@marieuwimana_art",
    twitter: "@marieuwimana",
    website: "www.marieuwimana.art",
  },
  artworks: [
    {
      id: "1",
      title: "Ocean Waves",
      price: 42000,
      kgDiverted: 2.5,
      favourites: 18,
      views: 245,
    },
    {
      id: "2",
      title: "City Lights",
      price: 55000,
      kgDiverted: 3.2,
      favourites: 24,
      views: 312,
    },
    {
      id: "3",
      title: "Mountain Sunrise",
      price: 35000,
      kgDiverted: 1.8,
      favourites: 12,
      views: 156,
    },
    {
      id: "4",
      title: "African Heritage",
      price: 85000,
      kgDiverted: 4.5,
      favourites: 67,
      views: 523,
    },
    {
      id: "5",
      title: "Sunset Reflections",
      price: 38000,
      kgDiverted: 2.0,
      favourites: 15,
      views: 189,
    },
    {
      id: "6",
      title: "Garden Dreams",
      price: 28000,
      kgDiverted: 1.2,
      favourites: 8,
      views: 98,
    },
  ],
  reviews: [
    {
      id: "r1",
      buyer: "John D.",
      rating: 5,
      comment: "Amazing artwork! The attention to detail is incredible, and knowing it's made from recycled materials makes it even more special.",
      date: "April 2026",
      artwork: "Ocean Waves",
    },
    {
      id: "r2",
      buyer: "Sarah M.",
      rating: 5,
      comment: "Marie is a talented artist. The piece arrived beautifully packaged and looks even better in person.",
      date: "March 2026",
      artwork: "City Lights",
    },
    {
      id: "r3",
      buyer: "Michael C.",
      rating: 4,
      comment: "Beautiful work that tells a story. Very happy with my purchase.",
      date: "February 2026",
      artwork: "Mountain Sunrise",
    },
  ],
};

export default function ArtistProfilePage() {
  const params = useParams();
  const artist = artistData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Cover Image */}
      <div className="h-48 sm:h-64 bg-gradient-to-br from-teal-500 via-teal-600 to-amber-500 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Recycle className="w-24 h-24 text-white/20" />
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-20 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0 -mt-20 sm:-mt-24">
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-teal-100 to-amber-100 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-bold text-teal-600">
                    {artist.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {artist.name}
                      </h1>
                      {artist.isVerified && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-gray-500 text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {artist.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {artist.joinedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Contact
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {artist.stats.artworks}
                    </p>
                    <p className="text-sm text-gray-500">Artworks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {artist.stats.sales}
                    </p>
                    <p className="text-sm text-gray-500">Sales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {(artist.stats.views / 1000).toFixed(1)}k
                    </p>
                    <p className="text-sm text-gray-500">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {artist.stats.followers}
                    </p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {artist.stats.kgDiverted}
                    </p>
                    <p className="text-sm text-gray-500">kg Diverted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pb-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{artist.bio}</p>

              {/* Specialties */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Specialties
                </h3>
                <div className="flex flex-wrap gap-2">
                  {artist.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Materials */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Preferred Materials
                </h3>
                <div className="flex flex-wrap gap-2">
                  {artist.preferredMaterials.map((material) => (
                    <span
                      key={material}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      <Recycle className="w-3 h-3" />
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Artworks */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Artworks</h2>
                <Link
                  href={`/marketplace?artist=${artist.id}`}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {artist.artworks.map((artwork) => (
                  <Link
                    key={artwork.id}
                    href={`/artwork/${artwork.id}`}
                    className="group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Palette className="w-12 h-12 text-teal-300" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <div className="mt-2">
                      <p className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                        {artwork.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm font-semibold text-teal-600">
                          {artwork.price.toLocaleString()} RWF
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-0.5">
                            <Heart className="w-3 h-3" />
                            {artwork.favourites}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3" />
                            {artwork.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-current" />
                  <span className="font-semibold text-gray-900">4.8</span>
                  <span className="text-gray-500">
                    ({artist.reviews.length} reviews)
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                {artist.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.buyer}
                        </p>
                        <p className="text-sm text-gray-500">
                          {review.artwork} • {review.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-amber-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Environmental Impact */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Recycle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    Environmental Impact
                  </p>
                  <p className="text-sm text-gray-600">Total waste diverted</p>
                </div>
              </div>
              <p className="text-4xl font-bold text-green-600 mb-1">
                {artist.stats.kgDiverted} kg
              </p>
              <p className="text-sm text-gray-600">
                Equivalent to saving {Math.round(artist.stats.kgDiverted * 2.5)} kg of CO₂
              </p>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
              <div className="space-y-3">
                {artist.social.instagram && (
                  <a
                    href={`https://instagram.com/${artist.social.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Camera className="w-5 h-5 text-pink-600" />
                    <span className="text-gray-700">{artist.social.instagram}</span>
                  </a>
                )}
                {artist.social.twitter && (
                  <a
                    href={`https://twitter.com/${artist.social.twitter.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-700">{artist.social.twitter}</span>
                  </a>
                )}
                {artist.social.website && (
                  <a
                    href={`https://${artist.social.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-teal-600" />
                    <span className="text-gray-700">{artist.social.website}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                  <Award className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-gray-900">Top Seller</p>
                    <p className="text-xs text-gray-500">April 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Recycle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Eco Champion</p>
                    <p className="text-xs text-gray-500">25+ kg diverted</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Verified Artist</p>
                    <p className="text-xs text-gray-500">Identity confirmed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
