"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Gavel,
  Clock,
  TrendingUp,
  Users,
  Heart,
  Eye,
  ArrowRight,
  Filter,
  ChevronDown,
  Flame,
  Timer,
  Award,
  CheckCircle,
  AlertCircle,
  Recycle,
} from "lucide-react";

// Mock auction data
const liveAuctions = [
  {
    id: 1,
    title: "Golden Savanna",
    artist: "Marie Uwimana",
    artistVerified: true,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
    startingPrice: 75000,
    currentBid: 125000,
    totalBids: 23,
    watchers: 45,
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    materials: ["PET bottles", "fabric"],
    kgDiverted: 4.2,
    isHot: true,
  },
  {
    id: 2,
    title: "Crimson Dreams",
    artist: "Jean Baptiste",
    artistVerified: true,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800",
    startingPrice: 50000,
    currentBid: 82000,
    totalBids: 15,
    watchers: 32,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
    materials: ["cardboard", "paper"],
    kgDiverted: 2.8,
    isHot: false,
  },
  {
    id: 3,
    title: "Emerald Forest",
    artist: "Claudine Mukiza",
    artistVerified: true,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800",
    startingPrice: 90000,
    currentBid: 145000,
    totalBids: 31,
    watchers: 67,
    endTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
    materials: ["bottle caps", "metal"],
    kgDiverted: 5.5,
    isHot: true,
  },
  {
    id: 4,
    title: "Urban Symphony",
    artist: "Patrick Nshimiye",
    artistVerified: false,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
    startingPrice: 40000,
    currentBid: 58000,
    totalBids: 8,
    watchers: 19,
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    materials: ["aluminum", "fabric"],
    kgDiverted: 2.1,
    isHot: false,
  },
];

const upcomingAuctions = [
  {
    id: 5,
    title: "Midnight Bloom",
    artist: "Grace Ingabire",
    artistVerified: true,
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800",
    startingPrice: 120000,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    materials: ["glass", "PET"],
    kgDiverted: 6.2,
  },
  {
    id: 6,
    title: "River Song",
    artist: "Emmanuel Habimana",
    artistVerified: true,
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800",
    startingPrice: 85000,
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    materials: ["fabric", "cardboard"],
    kgDiverted: 3.8,
  },
];

const pastAuctions = [
  {
    id: 7,
    title: "Desert Rose",
    artist: "Alice Uwase",
    soldPrice: 180000,
    image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=800",
    winner: "John K.",
  },
  {
    id: 8,
    title: "Mountain Echo",
    artist: "David Mugabo",
    soldPrice: 220000,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
    winner: "Sarah M.",
  },
];

function formatTimeRemaining(endTime: Date) {
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

function AuctionCard({ auction, isLive = true }: { auction: typeof liveAuctions[0]; isLive?: boolean }) {
  const [timeLeft, setTimeLeft] = useState(formatTimeRemaining(auction.endTime));
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    if (!isLive) return;

    const timer = setInterval(() => {
      setTimeLeft(formatTimeRemaining(auction.endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [auction.endTime, isLive]);

  const isEndingSoon = auction.endTime.getTime() - Date.now() < 60 * 60 * 1000; // Less than 1 hour

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={auction.image}
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status Badge */}
        {isLive && (
          <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-medium ${
            isEndingSoon ? "bg-red-500" : "bg-green-500"
          }`}>
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {isEndingSoon ? "Ending Soon" : "Live"}
          </div>
        )}

        {/* Hot Badge */}
        {auction.isHot && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-medium">
            <Flame className="w-3 h-3" />
            Hot
          </div>
        )}

        {/* Watch Button */}
        <button
          onClick={() => setIsWatching(!isWatching)}
          className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${
            isWatching
              ? "bg-red-500 text-white"
              : "bg-white/90 text-gray-600 hover:bg-white"
          }`}
        >
          <Heart className={`w-5 h-5 ${isWatching ? "fill-current" : ""}`} />
        </button>

        {/* Time Remaining */}
        {isLive && (
          <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
            isEndingSoon ? "bg-red-500/90 text-white" : "bg-white/90 text-gray-900"
          }`}>
            <Timer className="w-4 h-4" />
            {timeLeft}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
              {auction.title}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <span>{auction.artist}</span>
              {auction.artistVerified && (
                <CheckCircle className="w-4 h-4 text-teal-500" />
              )}
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {auction.materials.map((m, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs"
            >
              {m}
            </span>
          ))}
          <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs flex items-center gap-1">
            <Recycle className="w-3 h-3" />
            {auction.kgDiverted} kg
          </span>
        </div>

        {/* Bidding Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Current Bid</span>
            <span className="text-lg font-bold text-gray-900">
              {auction.currentBid.toLocaleString()} RWF
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Starting: {auction.startingPrice.toLocaleString()} RWF</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Gavel className="w-4 h-4" />
                {auction.totalBids}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {auction.watchers}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/auctions/${auction.id}`}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors"
        >
          Place Bid
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function AuctionsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "ending-soon" | "hot">("all");
  const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "past">("live");

  const filteredAuctions = liveAuctions.filter((auction) => {
    if (filter === "ending-soon") {
      return auction.endTime.getTime() - Date.now() < 2 * 60 * 60 * 1000;
    }
    if (filter === "hot") {
      return auction.isHot;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="h-16" />

      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/marketplace");
              }
            }}
            className="inline-flex items-center gap-2 text-teal-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Gavel className="w-10 h-10" />
                <h1 className="text-4xl font-bold">Live Auctions</h1>
              </div>
              <p className="text-teal-100 text-lg">
                Bid on exclusive upcycled artworks and own a piece of sustainable African art
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{liveAuctions.length}</div>
                <div className="text-teal-200 text-sm">Live Auctions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{upcomingAuctions.length}</div>
                <div className="text-teal-200 text-sm">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {liveAuctions.reduce((sum, a) => sum + a.totalBids, 0)}
                </div>
                <div className="text-teal-200 text-sm">Total Bids</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200">
          {[
            { id: "live", label: "Live Auctions", icon: Clock, count: liveAuctions.length },
            { id: "upcoming", label: "Upcoming", icon: Timer, count: upcomingAuctions.length },
            { id: "past", label: "Past Auctions", icon: Award, count: pastAuctions.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters (for Live tab) */}
        {activeTab === "live" && (
          <div className="flex items-center gap-3 mb-6">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex gap-2">
              {[
                { id: "all", label: "All" },
                { id: "ending-soon", label: "Ending Soon" },
                { id: "hot", label: "Hot" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as typeof filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f.id
                      ? "bg-teal-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Auctions Grid */}
        {activeTab === "live" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}

        {/* Upcoming Auctions */}
        {activeTab === "upcoming" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAuctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Timer className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Starts in</p>
                      <p className="text-xl font-bold">
                        {Math.ceil((auction.startTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900">{auction.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{auction.artist}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Starting Price</span>
                    <span className="font-bold text-gray-900">
                      {auction.startingPrice.toLocaleString()} RWF
                    </span>
                  </div>
                  <button className="mt-4 w-full py-2 border border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors">
                    Set Reminder
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past Auctions */}
        {activeTab === "past" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pastAuctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-full object-cover grayscale-[30%]"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-gray-900 text-white rounded-full text-sm font-medium">
                    Sold
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{auction.title}</h3>
                  <p className="text-sm text-gray-600">{auction.artist}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Final Price</span>
                      <span className="font-bold text-green-600">
                        {auction.soldPrice.toLocaleString()} RWF
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Won by {auction.winner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How Auctions Work */}
        <section className="mt-16 bg-white rounded-2xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How Auctions Work
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                title: "Browse",
                description: "Explore live and upcoming auctions for unique artworks",
              },
              {
                step: 2,
                title: "Register",
                description: "Sign up or log in to participate in bidding",
              },
              {
                step: 3,
                title: "Bid",
                description: "Place your bid. The minimum bid is the artist's starting price",
              },
              {
                step: 4,
                title: "Win",
                description: "Highest bidder when time expires wins the artwork",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
