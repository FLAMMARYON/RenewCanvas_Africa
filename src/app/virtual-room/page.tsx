"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Home,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingCart,
  Heart,
  Maximize2,
  Move,
} from "lucide-react";

// Mock artworks for the virtual gallery
const galleryArtworks = [
  {
    id: 1,
    title: "Ocean Waves",
    artist: "Marie Uwimana",
    price: 45000,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800",
    materials: ["PET bottles", "fabric"],
    kgDiverted: 2.5,
  },
  {
    id: 2,
    title: "Sunset Dreams",
    artist: "Jean Baptiste",
    price: 38000,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800",
    materials: ["cardboard", "paper"],
    kgDiverted: 1.8,
  },
  {
    id: 3,
    title: "Forest Spirit",
    artist: "Claudine Mukiza",
    price: 52000,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=800",
    materials: ["bottle caps", "metal"],
    kgDiverted: 3.2,
  },
  {
    id: 4,
    title: "Urban Rhythm",
    artist: "Patrick Nshimiye",
    price: 41000,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
    materials: ["aluminum cans", "fabric"],
    kgDiverted: 2.1,
  },
  {
    id: 5,
    title: "Mountain Echo",
    artist: "Grace Ingabire",
    price: 67000,
    image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800",
    materials: ["glass", "PET bottles"],
    kgDiverted: 4.5,
  },
  {
    id: 6,
    title: "River Dance",
    artist: "Emmanuel Habimana",
    price: 35000,
    image: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800",
    materials: ["fabric scraps", "cardboard"],
    kgDiverted: 1.5,
  },
  {
    id: 7,
    title: "Golden Hour",
    artist: "Alice Uwase",
    price: 48000,
    image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=800",
    materials: ["bottle caps", "paper"],
    kgDiverted: 2.8,
  },
  {
    id: 8,
    title: "Serene Landscape",
    artist: "David Mugabo",
    price: 55000,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
    materials: ["PET bottles", "burlap"],
    kgDiverted: 3.7,
  },
];

export default function VirtualRoomPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewAngle, setViewAngle] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedArtwork, setSelectedArtwork] = useState<typeof galleryArtworks[0] | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [walkPosition, setWalkPosition] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          navigateLeft();
          break;
        case "ArrowRight":
          navigateRight();
          break;
        case "ArrowUp":
          zoomIn();
          break;
        case "ArrowDown":
          zoomOut();
          break;
        case "Escape":
          setSelectedArtwork(null);
          break;
        case " ":
          e.preventDefault();
          if (galleryArtworks[currentIndex]) {
            setSelectedArtwork(galleryArtworks[currentIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const navigateLeft = () => {
    setViewAngle((prev) => prev + 15);
    setCurrentIndex((prev) => (prev === 0 ? galleryArtworks.length - 1 : prev - 1));
  };

  const navigateRight = () => {
    setViewAngle((prev) => prev - 15);
    setCurrentIndex((prev) => (prev === galleryArtworks.length - 1 ? 0 : prev + 1));
  };

  const walkForward = () => {
    setWalkPosition((prev) => Math.min(prev + 10, 50));
    setZoom((prev) => Math.min(prev + 0.1, 1.5));
  };

  const walkBackward = () => {
    setWalkPosition((prev) => Math.max(prev - 10, -20));
    setZoom((prev) => Math.max(prev - 0.1, 0.8));
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const resetView = () => {
    setViewAngle(0);
    setZoom(1);
    setWalkPosition(0);
  };

  const getVisibleArtworks = () => {
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + galleryArtworks.length) % galleryArtworks.length;
      visible.push({ ...galleryArtworks[index], position: i });
    }
    return visible;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-gray-900 via-gray-900/90 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-teal-400 transition-colors">
            <Home className="w-5 h-5" />
            <span className="font-medium">Exit Gallery</span>
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-400 to-amber-400 bg-clip-text text-transparent">
            Virtual Art Gallery
          </h1>
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            {showControls ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Gallery View */}
      <main className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Museum Floor */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
            perspective: "1000px",
          }}
        >
          {/* Floor Grid */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1/3"
            style={{
              background: `
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              transform: "perspective(500px) rotateX(60deg)",
              transformOrigin: "bottom",
            }}
          />

          {/* Ceiling Lights */}
          <div className="absolute top-20 left-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent rounded-full blur-sm" />
          <div className="absolute top-20 right-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-amber-400/30 to-transparent rounded-full blur-sm" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full blur-sm" />
        </div>

        {/* 3D Gallery Space */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-500"
          style={{
            transform: `perspective(1200px) rotateY(${viewAngle}deg) translateZ(${walkPosition}px) scale(${zoom})`,
          }}
        >
          {/* Artwork Frames */}
          <div className="relative flex items-center gap-8">
            {getVisibleArtworks().map((artwork, idx) => {
              const isCenter = artwork.position === 0;
              const distance = Math.abs(artwork.position);
              const opacity = 1 - distance * 0.25;
              const scale = 1 - distance * 0.15;
              const zIndex = 10 - distance;
              const translateZ = -distance * 100;
              const rotateY = artwork.position * -15;

              return (
                <div
                  key={artwork.id}
                  className={`relative transition-all duration-500 cursor-pointer group ${
                    isCenter ? "z-20" : ""
                  }`}
                  style={{
                    opacity,
                    transform: `translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    zIndex,
                  }}
                  onClick={() => isCenter && setSelectedArtwork(artwork)}
                >
                  {/* Frame */}
                  <div
                    className={`relative bg-gradient-to-br from-amber-800 via-amber-900 to-amber-950 p-4 rounded shadow-2xl ${
                      isCenter ? "ring-2 ring-amber-400/50" : ""
                    }`}
                    style={{
                      boxShadow: isCenter
                        ? "0 0 60px rgba(251, 191, 36, 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.8)"
                        : "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {/* Artwork Image */}
                    <div className="relative overflow-hidden rounded">
                      <img
                        src={artwork.image}
                        alt={artwork.title}
                        className={`w-64 h-80 object-cover transition-transform duration-300 ${
                          isCenter ? "group-hover:scale-105" : ""
                        }`}
                      />

                      {/* Spotlight Effect */}
                      {isCenter && (
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30 pointer-events-none" />
                      )}

                      {/* View Indicator */}
                      {isCenter && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                            <Eye className="w-5 h-5" />
                            <span className="text-sm font-medium">View Details</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Artwork Label */}
                    <div className="mt-3 text-center">
                      <h3 className={`font-semibold ${isCenter ? "text-white" : "text-gray-400"}`}>
                        {artwork.title}
                      </h3>
                      <p className={`text-sm ${isCenter ? "text-gray-300" : "text-gray-500"}`}>
                        {artwork.artist}
                      </p>
                    </div>
                  </div>

                  {/* Floor Shadow */}
                  <div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-4 bg-black/40 rounded-full blur-xl"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={navigateLeft}
          className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all hover:scale-110 z-30"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={navigateRight}
          className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all hover:scale-110 z-30"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Artwork Counter */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
          <div className="flex gap-2">
            {galleryArtworks.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? "bg-amber-400 w-8"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Controls Panel */}
      {showControls && (
        <div className="fixed bottom-24 right-8 bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 space-y-3 z-40">
          <p className="text-xs text-gray-400 text-center mb-2">Navigation</p>

          {/* Walk Controls */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={walkForward}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Walk Forward"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={navigateLeft}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Turn Left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={walkBackward}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Walk Backward"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onClick={navigateRight}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Turn Right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-700">
            <button
              onClick={zoomOut}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={zoomIn}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Keyboard Hints */}
          <div className="pt-2 border-t border-gray-700 text-center">
            <p className="text-xs text-gray-500">
              Use arrow keys to navigate
            </p>
            <p className="text-xs text-gray-500">
              Press Space to view artwork
            </p>
          </div>
        </div>
      )}

      {/* Selected Artwork Modal */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedArtwork(null)}
        >
          <div
            className="relative max-w-4xl w-full mx-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-[3/4]">
                <img
                  src={selectedArtwork.image}
                  alt={selectedArtwork.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="p-8 flex flex-col">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {selectedArtwork.title}
                  </h2>
                  <p className="text-xl text-gray-400 mb-6">
                    by {selectedArtwork.artist}
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-gray-800">
                      <span className="text-gray-400">Price</span>
                      <span className="text-2xl font-bold text-amber-400">
                        {selectedArtwork.price.toLocaleString()} RWF
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-800">
                      <span className="text-gray-400">Materials</span>
                      <div className="flex gap-2">
                        {selectedArtwork.materials.map((m, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-teal-500/20 text-teal-400 rounded-full text-sm"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-gray-800">
                      <span className="text-gray-400">Impact</span>
                      <span className="text-lg font-semibold text-green-400">
                        {selectedArtwork.kgDiverted} kg waste diverted
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 rounded-xl font-semibold transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                    Purchase
                  </button>
                  <button className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                    <Heart className="w-6 h-6" />
                  </button>
                  <Link
                    href={`/artwork/${selectedArtwork.id}`}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Maximize2 className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Toast */}
      <div className="fixed bottom-8 left-8 bg-gray-800/90 backdrop-blur-sm rounded-xl px-4 py-3 z-40">
        <div className="flex items-center gap-3">
          <Move className="w-5 h-5 text-amber-400" />
          <p className="text-sm text-gray-300">
            Click on the center artwork to view details
          </p>
        </div>
      </div>
    </div>
  );
}
