"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { CheckCircle, ClipboardList, XCircle } from "lucide-react";

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
};

export default function ArtistCommissionsPage() {
  const [requests, setRequests] = useState<CommissionRequest[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
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
  }

  async function respond(requestId: string, decision: "accepted" | "rejected") {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/commissions/${requestId}/respond`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, note: notes[requestId] ?? "" }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.message ?? "Unable to respond.");
      setMessage(decision === "accepted" ? "Commission accepted." : "Commission rejected.");
      await loadRequests();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to respond.");
    }
  }

  return (
    <DashboardLayout role="artist" userName="Artist">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Assignments</h1>
          <p className="text-gray-500">Review custom-work requests assigned by RenewCanvas admins.</p>
        </div>

        {error && <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">{message}</div>}

        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-teal-600" />
                    <h2 className="font-semibold text-gray-900">{request.title}</h2>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{request.description}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    Budget: {request.budgetAmount.toLocaleString()} {request.currency} / Size: {request.dimensions ?? request.sizeCategory}
                  </p>
                  {request.preferredMaterials && <p className="text-sm text-gray-500">Preferred materials: {request.preferredMaterials}</p>}
                  {request.adminNotes && <p className="text-sm text-blue-700">Admin note: {request.adminNotes}</p>}
                  {request.artistResponseNote && <p className="text-sm text-gray-500">Your note: {request.artistResponseNote}</p>}
                </div>
                <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">{request.status}</span>
              </div>

              {request.status === "assigned" && (
                <div className="space-y-3">
                  <textarea
                    value={notes[request.id] ?? ""}
                    onChange={(e) => setNotes({ ...notes, [request.id]: e.target.value })}
                    placeholder="Optional response note to admin"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => respond(request.id, "accepted")} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                      <CheckCircle className="w-4 h-4" />
                      Accept Project
                    </button>
                    <button onClick={() => respond(request.id, "rejected")} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {requests.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500">
              No assigned commission requests yet.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
