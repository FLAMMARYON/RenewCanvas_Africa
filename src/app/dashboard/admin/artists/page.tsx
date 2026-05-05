"use client";

import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Palette,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

const initialArtists = [
  {
    id: "1",
    name: "Marie Uwimana",
    email: "marie@example.com",
    phone: "+250 788 123 456",
    location: "Kigali, Rwanda",
    status: "verified",
    verificationStatus: "approved",
    joinedAt: "2026-01-15",
    artworksCount: 12,
    salesCount: 8,
    bio: "Passionate artist creating sustainable art from recycled materials.",
    specialties: ["Sculpture", "Mixed Media"],
    documents: ["ID Card", "Portfolio", "Material Proof"],
    submittedAt: "2026-01-10",
    reviewedAt: "2026-01-15",
  },
  {
    id: "2",
    name: "Jean Baptiste",
    email: "jean@example.com",
    phone: "+250 788 234 567",
    location: "Musanze, Rwanda",
    status: "pending",
    verificationStatus: "pending",
    joinedAt: "2026-03-10",
    artworksCount: 6,
    salesCount: 3,
    bio: "Creating beautiful jewelry from recycled bottle caps and glass.",
    specialties: ["Jewelry", "Home Decor"],
    documents: ["ID Card", "Portfolio"],
    submittedAt: "2026-04-25",
  },
  {
    id: "3",
    name: "Claudine Mukiza",
    email: "claudine@example.com",
    phone: "+250 788 345 678",
    location: "Huye, Rwanda",
    status: "verified",
    verificationStatus: "approved",
    joinedAt: "2026-01-05",
    artworksCount: 8,
    salesCount: 10,
    bio: "Traditional weaving meets modern sustainability.",
    specialties: ["Wall Art", "Functional Art"],
    documents: ["ID Card", "Portfolio", "Material Proof"],
    submittedAt: "2026-01-02",
    reviewedAt: "2026-01-05",
  },
  {
    id: "4",
    name: "Patrick Habimana",
    email: "patrick@example.com",
    phone: "+250 788 456 789",
    location: "Kigali, Rwanda",
    status: "pending",
    verificationStatus: "pending",
    joinedAt: "2026-04-20",
    artworksCount: 3,
    salesCount: 0,
    bio: "Transforming electronic waste into stunning art pieces.",
    specialties: ["Sculpture"],
    documents: ["ID Card"],
    submittedAt: "2026-04-28",
  },
  {
    id: "5",
    name: "Grace Ingabire",
    email: "grace@example.com",
    phone: "+250 788 567 890",
    location: "Rubavu, Rwanda",
    status: "rejected",
    verificationStatus: "rejected",
    joinedAt: "2026-02-15",
    artworksCount: 2,
    salesCount: 0,
    bio: "Fashion designer using recycled fabrics.",
    specialties: ["Fashion"],
    documents: ["ID Card"],
    submittedAt: "2026-03-01",
    reviewedAt: "2026-03-05",
    rejectionReason: "Incomplete documentation - missing material proof",
  },
  {
    id: "6",
    name: "Emmanuel Niyonzima",
    email: "emmanuel@example.com",
    phone: "+250 788 678 901",
    location: "Gisenyi, Rwanda",
    status: "pending",
    verificationStatus: "pending",
    joinedAt: "2026-04-25",
    artworksCount: 4,
    salesCount: 1,
    bio: "Creating unique sculptures from metal scraps.",
    specialties: ["Sculpture", "Installation"],
    documents: ["ID Card", "Portfolio", "Material Proof"],
    submittedAt: "2026-04-30",
  },
];

const statusConfig = {
  pending: {
    label: "Pending Review",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    icon: Clock,
  },
  approved: {
    label: "Verified",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: XCircle,
  },
};

export default function AdminArtistsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedArtist, setExpandedArtist] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [artists, setArtists] = useState(initialArtists);

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || artist.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: artists.length,
    pending: artists.filter((a) => a.verificationStatus === "pending").length,
    verified: artists.filter((a) => a.verificationStatus === "approved").length,
    rejected: artists.filter((a) => a.verificationStatus === "rejected").length,
  };

  const toggleExpand = (id: string) => {
    setExpandedArtist(expandedArtist === id ? null : id);
  };

  const handleApprove = (artistId: string) => {
    setArtists((current) =>
      current.map((artist) =>
        artist.id === artistId
          ? {
              ...artist,
              status: "verified",
              verificationStatus: "approved",
              reviewedAt: new Date().toISOString().slice(0, 10),
              rejectionReason: undefined,
            }
          : artist
      )
    );
  };

  const handleReject = (artistId: string) => {
    setArtists((current) =>
      current.map((artist) =>
        artist.id === artistId
          ? {
              ...artist,
              status: "rejected",
              verificationStatus: "rejected",
              reviewedAt: new Date().toISOString().slice(0, 10),
              rejectionReason: rejectionReason.trim() || "Application requires more documentation.",
            }
          : artist
      )
    );
    setShowRejectModal(null);
    setRejectionReason("");
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Artist Verification
          </h1>
          <p className="text-gray-500">Review and verify artist applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Artists</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.pending}
                </p>
                <p className="text-sm text-gray-500">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.verified}
                </p>
                <p className="text-sm text-gray-500">Verified</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
                <p className="text-sm text-gray-500">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Artists List */}
        <div className="space-y-4">
          {filteredArtists.map((artist) => {
            const status =
              statusConfig[
                artist.verificationStatus as keyof typeof statusConfig
              ];
            const StatusIcon = status.icon;
            const isExpanded = expandedArtist === artist.id;

            return (
              <div
                key={artist.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                {/* Artist Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(artist.id)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center font-bold text-purple-700 text-lg">
                        {artist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {artist.name}
                          </h3>
                          {artist.verificationStatus === "approved" && (
                            <Award className="w-4 h-4 text-blue-500" />
                          )}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {artist.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {artist.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-500">Submitted</p>
                        <p className="font-medium text-gray-900">
                          {artist.submittedAt}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Artist Info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            About
                          </h4>
                          <p className="text-sm text-gray-600">{artist.bio}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Contact
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              {artist.email}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-4 h-4" />
                              {artist.phone}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              {artist.location}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Specialties
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {artist.specialties.map((specialty) => (
                              <span
                                key={specialty}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Activity
                          </h4>
                          <div className="flex gap-4 text-sm">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Palette className="w-4 h-4" />
                              {artist.artworksCount} artworks
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Award className="w-4 h-4" />
                              {artist.salesCount} sales
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              Joined {artist.joinedAt}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Documents & Actions */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Submitted Documents
                          </h4>
                          <div className="space-y-2">
                            {artist.documents.map((doc) => (
                              <div
                                key={doc}
                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-700">
                                    {doc}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {artist.verificationStatus === "rejected" &&
                          artist.rejectionReason && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                  <p className="font-medium text-red-700">
                                    Rejection Reason
                                  </p>
                                  <p className="text-sm text-red-600 mt-1">
                                    {artist.rejectionReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {artist.verificationStatus === "pending" && (
                          <div className="flex gap-3 pt-4">
                            <button
                              onClick={() => handleApprove(artist.id)}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => setShowRejectModal(artist.id)}
                              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}

                        {artist.verificationStatus === "approved" && (
                          <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <div>
                                <p className="font-medium text-green-700">
                                  Verified Artist
                                </p>
                                <p className="text-sm text-green-600">
                                  Approved on {artist.reviewedAt}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty State */}
          {filteredArtists.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Palette className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-1">
                No artists found
              </h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No artist verification requests at this time"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-gray-900 mb-2">
              Reject Verification
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting this verification request.
              This will be shared with the artist.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
