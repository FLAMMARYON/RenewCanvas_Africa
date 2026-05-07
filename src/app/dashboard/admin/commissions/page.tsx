"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { ClipboardList, Send, UserCheck } from "lucide-react";

type UserOption = { id: string; name: string; email: string };
type CommissionRequest = {
  id: string;
  title: string;
  description: string;
  preferredMaterials: string | null;
  budgetAmount: number;
  currency: string;
  sizeCategory: string;
  dimensions: string | null;
  status: string;
  adminNotes: string | null;
  artistResponseNote: string | null;
  buyer: UserOption;
  assignedArtist?: UserOption | null;
};

export default function AdminCommissionsPage() {
  const [requests, setRequests] = useState<CommissionRequest[]>([]);
  const [artists, setArtists] = useState<UserOption[]>([]);
  const [assignments, setAssignments] = useState<Record<string, { artistId: string; adminNotes: string }>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const response = await fetch("/api/commissions", { credentials: "include" });
    if (!response.ok) return;
    const body = await response.json();
    setRequests(body.requests ?? []);
    setArtists(body.artists ?? []);
  }

  async function assignRequest(requestId: string) {
    setError("");
    setMessage("");
    const assignment = assignments[requestId];
    if (!assignment?.artistId) {
      setError("Choose an artist before assigning the commission.");
      return;
    }

    try {
      const response = await fetch(`/api/commissions/${requestId}/assign`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.message ?? "Unable to assign commission.");
      setMessage("Commission assigned to artist.");
      await loadRequests();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to assign commission.");
    }
  }

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Requests</h1>
          <p className="text-gray-500">Review buyer custom-work requests and assign them to artists.</p>
        </div>

        {error && <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">{message}</div>}

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
            <p className="text-sm text-gray-500">Total requests</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-amber-600">{requests.filter((item) => item.status === "submitted").length}</p>
            <p className="text-sm text-gray-500">Needs assignment</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-2xl font-bold text-teal-600">{requests.filter((item) => item.status === "accepted").length}</p>
            <p className="text-sm text-gray-500">Accepted by artists</p>
          </div>
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-teal-600" />
                    <h2 className="font-semibold text-gray-900">{request.title}</h2>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{request.description}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Buyer: {request.buyer.name} / Budget: {request.budgetAmount.toLocaleString()} {request.currency} / Size: {request.dimensions ?? request.sizeCategory}
                  </p>
                  {request.preferredMaterials && <p className="text-sm text-gray-500">Preferred materials: {request.preferredMaterials}</p>}
                  {request.assignedArtist && <p className="text-sm text-teal-700">Assigned artist: {request.assignedArtist.name}</p>}
                  {request.artistResponseNote && <p className="text-sm text-gray-500">Artist note: {request.artistResponseNote}</p>}
                </div>
                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{request.status}</span>
              </div>

              <div className="grid lg:grid-cols-[1fr_2fr_auto] gap-3">
                <select
                  value={assignments[request.id]?.artistId ?? request.assignedArtist?.id ?? ""}
                  onChange={(e) =>
                    setAssignments({
                      ...assignments,
                      [request.id]: { artistId: e.target.value, adminNotes: assignments[request.id]?.adminNotes ?? "" },
                    })
                  }
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="">Choose artist</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>{artist.name}</option>
                  ))}
                </select>
                <input
                  value={assignments[request.id]?.adminNotes ?? request.adminNotes ?? ""}
                  onChange={(e) =>
                    setAssignments({
                      ...assignments,
                      [request.id]: { artistId: assignments[request.id]?.artistId ?? request.assignedArtist?.id ?? "", adminNotes: e.target.value },
                    })
                  }
                  placeholder="Admin notes for the artist"
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button onClick={() => assignRequest(request.id)} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  <UserCheck className="w-4 h-4" />
                  Assign
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
              <Send className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No commission requests yet.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
