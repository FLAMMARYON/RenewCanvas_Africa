"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { listArtworks, type FrontendArtwork } from "@/lib/frontend/artworks-api";
import { Calendar, CheckCircle, Clock, DollarSign, Flame, Gavel, Image as ImageIcon, Plus, Search, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Auction = {
  id: string;
  artworkId: string;
  status: "draft" | "scheduled" | "live" | "ended" | "cancelled" | "settled";
  title: string;
  startsAt: string;
  endsAt: string;
  startingBidAmount: number;
  reserveAmount: number | null;
  minIncrementAmount: number;
  currency: string;
  winnerBidId: string | null;
  bids: Array<{ id: string; amount: number; status: string; createdAt: string }>;
};

const statusConfig = {
  live: { label: "Live", color: "text-green-600", bgColor: "bg-green-50", icon: Flame },
  scheduled: { label: "Scheduled", color: "text-blue-600", bgColor: "bg-blue-50", icon: Calendar },
  ended: { label: "Ended", color: "text-gray-600", bgColor: "bg-gray-50", icon: CheckCircle },
  settled: { label: "Settled", color: "text-gray-600", bgColor: "bg-gray-50", icon: CheckCircle },
  draft: { label: "Draft", color: "text-gray-600", bgColor: "bg-gray-50", icon: Clock },
  cancelled: { label: "Cancelled", color: "text-red-600", bgColor: "bg-red-50", icon: XCircle },
};

async function listAuctions(): Promise<Auction[]> {
  const response = await fetch("/api/auctions", { credentials: "include" });
  const payload = (await response.json()) as { ok: boolean; auctions?: Auction[]; message?: string };
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not load auctions.");
  return payload.auctions ?? [];
}

async function createAuction(input: { artworkId: string; startsAt: string; endsAt: string; startingBidCents: number; reserveCents: number; minIncrementCents: number }) {
  const response = await fetch("/api/auctions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const payload = (await response.json()) as { ok: boolean; message?: string };
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not create auction.");
}

export default function AdminAuctionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<string | null>(null);
  const [auctionDuration, setAuctionDuration] = useState("24");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [availableArtworks, setAvailableArtworks] = useState<FrontendArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    setError("");
    Promise.all([listAuctions(), listArtworks({ scope: "admin" })])
      .then(([auctionResult, artworkResult]) => {
        setAuctions(auctionResult);
        const auctionedArtworkIds = new Set(auctionResult.filter((auction) => !["ended", "cancelled", "settled"].includes(auction.status)).map((auction) => auction.artworkId));
        setAvailableArtworks(artworkResult.artworks.filter((artwork) => ["approved", "listed"].includes(artwork.status) && !auctionedArtworkIds.has(artwork.id)));
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load auctions."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAuctions = auctions.filter((auction) => {
    const artwork = availableArtworks.find((item) => item.id === auction.artworkId);
    const search = `${auction.title} ${artwork?.artist?.name ?? ""} ${auction.id}`.toLowerCase();
    return search.includes(searchQuery.toLowerCase()) && (statusFilter === "all" || auction.status === statusFilter);
  });

  const stats = useMemo(
    () => ({
      live: auctions.filter((auction) => auction.status === "live").length,
      scheduled: auctions.filter((auction) => auction.status === "scheduled").length,
      ended: auctions.filter((auction) => ["ended", "settled"].includes(auction.status)).length,
      totalRevenue: auctions.filter((auction) => ["ended", "settled"].includes(auction.status)).reduce((sum, auction) => sum + topBid(auction), 0),
    }),
    [auctions]
  );

  const getTimeRemaining = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    if (diff <= 0) return "Ended";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h ${minutes}m`;
  };

  const getSelectedArtworkDetails = () => availableArtworks.find((artwork) => artwork.id === selectedArtwork);

  const handleCreateAuction = async () => {
    const artwork = getSelectedArtworkDetails();
    if (!artwork) return;
    const start = startDate && startTime ? new Date(`${startDate}T${startTime}`).toISOString() : new Date().toISOString();
    const end = new Date(new Date(start).getTime() + Number(auctionDuration) * 60 * 60 * 1000).toISOString();
    try {
      await createAuction({
        artworkId: artwork.id,
        startsAt: start,
        endsAt: end,
        startingBidCents: Math.round(artwork.priceAmount * 100),
        reserveCents: Math.round(artwork.priceAmount * 100),
        minIncrementCents: 1000,
      });
      setShowCreateModal(false);
      setSelectedArtwork(null);
      setStartDate("");
      setStartTime("");
      loadData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create auction.");
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Auction Management</h1>
            <p className="text-gray-500">Create and manage live auctions for artworks</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
            <Plus className="w-5 h-5" />
            Create Auction
          </button>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Flame} label="Live Auctions" value={loading ? "-" : stats.live} tone="green" />
          <Stat icon={Calendar} label="Scheduled" value={loading ? "-" : stats.scheduled} tone="blue" />
          <Stat icon={CheckCircle} label="Completed" value={loading ? "-" : stats.ended} tone="gray" />
          <Stat icon={DollarSign} label="Total Revenue" value={`${loading ? "-" : stats.totalRevenue.toLocaleString()} RWF`} tone="teal" />
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search auctions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white">
              <option value="all">All Status</option>
              <option value="live">Live</option>
              <option value="scheduled">Scheduled</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Artwork</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Price</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Bid</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bids</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAuctions.map((auction) => {
                  const status = statusConfig[auction.status] ?? statusConfig.draft;
                  const StatusIcon = status.icon;
                  const currentBid = topBid(auction);
                  return (
                    <tr key={auction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0"><ImageIcon className="w-6 h-6 text-teal-500" /></div>
                          <div><p className="font-medium text-gray-900">{auction.title}</p><p className="text-sm text-gray-500">{auction.id}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}><StatusIcon className="w-3.5 h-3.5" />{status.label}</span></td>
                      <td className="px-6 py-4"><p className="font-medium text-gray-900">{auction.startingBidAmount.toLocaleString()} RWF</p></td>
                      <td className="px-6 py-4">{currentBid ? <p className="font-semibold text-green-600">{currentBid.toLocaleString()} RWF</p> : <p className="text-gray-400">No bids yet</p>}</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center gap-1 text-sm text-gray-600"><Gavel className="w-4 h-4" />{auction.bids.length}</span></td>
                      <td className="px-6 py-4"><span className="text-sm text-gray-500">{auction.status === "live" ? getTimeRemaining(auction.endsAt) : auction.status === "scheduled" ? `Starts in ${getTimeRemaining(auction.startsAt)}` : new Date(auction.endsAt).toLocaleDateString()}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && filteredAuctions.length === 0 && <div className="text-center py-12"><Gavel className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No auctions found</p></div>}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Create New Auction</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Artwork for Auction</label>
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {availableArtworks.map((artwork) => (
                      <button type="button" key={artwork.id} onClick={() => setSelectedArtwork(artwork.id)} className={`p-4 border rounded-xl text-left cursor-pointer transition-all ${selectedArtwork === artwork.id ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500" : "border-gray-200 hover:border-teal-200 hover:bg-gray-50"}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">{artwork.images[0] ? <img src={artwork.images[0].url} alt={artwork.images[0].altText} className="h-full w-full object-cover" /> : <ImageIcon className="w-8 h-8 text-teal-500" />}</div>
                          <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 truncate">{artwork.title}</p><p className="text-sm text-gray-500">by {artwork.artist?.name ?? "RenewCanvas Africa"}</p></div>
                          <div className="text-right"><p className="font-semibold text-gray-900">{artwork.priceAmount.toLocaleString()} RWF</p><p className="text-xs text-gray-500">Artist's price</p></div>
                        </div>
                      </button>
                    ))}
                    {!loading && availableArtworks.length === 0 && <p className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">No approved or listed artworks are available for auction.</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block text-sm font-medium text-gray-700">Auction Duration<select value={auctionDuration} onChange={(e) => setAuctionDuration(e.target.value)} className="mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white"><option value="6">6 hours</option><option value="12">12 hours</option><option value="24">24 hours</option><option value="48">48 hours</option><option value="72">72 hours</option><option value="168">7 days</option></select></label>
                  <label className="block text-sm font-medium text-gray-700">Start Date<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg" /></label>
                  <label className="block text-sm font-medium text-gray-700">Start Time<input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-2 w-full px-4 py-2.5 border border-gray-200 rounded-lg" /></label>
                </div>
              </div>
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={handleCreateAuction} disabled={!selectedArtwork || !startDate || !startTime} className="px-6 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Create Auction</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function topBid(auction: Auction) {
  return auction.bids.reduce((max, bid) => Math.max(max, bid.amount), 0);
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Flame; label: string; value: number | string; tone: "green" | "blue" | "gray" | "teal" }) {
  const colors = { green: "bg-green-50 text-green-600", blue: "bg-blue-50 text-blue-600", gray: "bg-gray-50 text-gray-600", teal: "bg-teal-50 text-teal-600" };
  const [bgColor, textColor] = colors[tone].split(" ");
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center gap-3 mb-3"><div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}><Icon className={`w-5 h-5 ${textColor}`} /></div><span className="text-sm text-gray-500">{label}</span></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
