"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { readWishlist, removeFromWishlist, type WishlistItem } from "@/lib/frontend/wishlist-api";
import { ArrowRight, Eye, Grid, Heart, List, Palette, Recycle, Search, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    readWishlist()
      .then(setItems)
      .catch((error) => setStatusMessage(error instanceof Error ? error.message : "Could not load wishlist."));

    // Fetch user name
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile?.firstName) {
          setUserName(data.profile.firstName);
        } else if (data?.user?.name) {
          setUserName(data.user.name.split(" ")[0]);
        }
      })
      .catch(() => {});
  }, []);

  const filteredItems = items.filter((item) => {
    const artwork = item.artwork;
    return `${artwork.title} ${artwork.artist?.name ?? ""}`.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const totalValue = filteredItems.reduce((sum, item) => sum + item.artwork.priceAmount, 0);
  const totalImpact = filteredItems.reduce((sum, item) => sum + item.artwork.kgDiverted, 0);

  const handleRemove = async (artworkId: string) => {
    await removeFromWishlist(artworkId);
    setItems((current) => current.filter((item) => item.artwork.id !== artworkId));
  };

  return (
    <DashboardLayout role="buyer" userName={userName}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500">{items.length} saved artworks backed by your account</p>
          </div>
        </div>

        {statusMessage && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {statusMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Summary icon={Heart} label="Total Saved" value={items.length.toString()} />
          <Summary icon={ShoppingCart} label="Available" value={filteredItems.length.toString()} tone="green" />
          <Summary icon={Recycle} label="Potential Impact" value={`${totalImpact.toFixed(1)} kg`} tone="teal" />
          <Summary icon={Palette} label="Total Value" value={totalValue.toLocaleString()} tone="amber" />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search saved artworks..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex overflow-hidden rounded-lg border border-gray-200">
            <button type="button" onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-teal-50 text-teal-600" : "text-gray-400"}`}>
              <Grid className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-teal-50 text-teal-600" : "text-gray-400"}`}>
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="mb-2 text-lg font-medium text-gray-900">No saved artworks found</h2>
            <p className="mb-6 text-gray-500">{searchQuery ? "Try a different search term" : "Save artwork from the marketplace to see it here."}</p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 font-medium text-white hover:bg-teal-700">
              Browse Marketplace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <WishlistCard key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
            {filteredItems.map((item) => (
              <WishlistRow key={item.id} item={item} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function WishlistCard({ item, onRemove }: { item: WishlistItem; onRemove: (artworkId: string) => void }) {
  const artwork = item.artwork;
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white transition hover:border-teal-200 hover:shadow-lg">
      <div className="relative aspect-square bg-teal-50">
        {artwork.images[0] ? (
          <img src={artwork.images[0].url} alt={artwork.images[0].altText} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Palette className="h-12 w-12 text-teal-300" />
          </div>
        )}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button onClick={() => onRemove(artwork.id)} className="rounded-full bg-white p-2 shadow-md hover:bg-red-50" title="Remove from wishlist">
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
          <Link href={`/artwork/${artwork.slug}`} className="rounded-full bg-white p-2 shadow-md hover:bg-teal-50" title="View artwork">
            <Eye className="h-4 w-4 text-teal-600" />
          </Link>
        </div>
      </div>
      <div className="p-4">
        <h2 className="truncate font-medium text-gray-900">{artwork.title}</h2>
        <p className="text-sm text-gray-500">by {artwork.artist?.name ?? "RenewCanvas Africa"}</p>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <p className="font-semibold text-gray-900">{artwork.priceAmount.toLocaleString()} RWF</p>
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <Recycle className="h-3 w-3" />
            {artwork.kgDiverted.toFixed(1)} kg
          </span>
        </div>
      </div>
    </div>
  );
}

function WishlistRow({ item, onRemove }: { item: WishlistItem; onRemove: (artworkId: string) => void }) {
  const artwork = item.artwork;
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50">
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-teal-50">
        {artwork.images[0] ? <img src={artwork.images[0].url} alt={artwork.images[0].altText} className="h-full w-full object-cover" /> : <Palette className="h-8 w-8 text-teal-300" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-medium text-gray-900">{artwork.title}</h2>
        <p className="text-sm text-gray-500">by {artwork.artist?.name ?? "RenewCanvas Africa"}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{artwork.priceAmount.toLocaleString()} RWF</p>
        <p className="text-xs text-green-600">{artwork.kgDiverted.toFixed(1)} kg diverted</p>
      </div>
      <Link href={`/artwork/${artwork.slug}`} className="p-2 text-gray-400 hover:text-teal-600">
        <Eye className="h-5 w-5" />
      </Link>
      <button onClick={() => onRemove(artwork.id)} className="p-2 text-gray-400 hover:text-red-600">
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}

function Summary({ icon: Icon, label, value, tone = "rose" }: { icon: typeof Heart; label: string; value: string; tone?: "rose" | "green" | "teal" | "amber" }) {
  const colors = {
    rose: "bg-rose-50 text-rose-600",
    green: "bg-green-50 text-green-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
