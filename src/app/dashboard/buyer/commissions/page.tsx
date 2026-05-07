"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { ClipboardList, DollarSign, Ruler, Send, Shield } from "lucide-react";

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
  createdAt: string;
  assignedArtist?: { name: string } | null;
};

const sizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "custom", label: "Specific dimensions" },
];

export default function BuyerCommissionsPage() {
  const [requests, setRequests] = useState<CommissionRequest[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    preferredMaterials: "",
    budgetAmount: "",
    sizeCategory: "medium",
    dimensions: "",
  });

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    const response = await fetch("/api/commissions", { credentials: "include" });
    if (!response.ok) return;
    const body = await response.json();
    setRequests(body.requests ?? []);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/commissions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budgetAmount: Number(form.budgetAmount),
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.message ?? "Unable to submit request.");
      setMessage("Commission request sent to RenewCanvas admins.");
      setForm({
        title: "",
        description: "",
        preferredMaterials: "",
        budgetAmount: "",
        sizeCategory: "medium",
        dimensions: "",
      });
      await loadRequests();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DashboardLayout role="buyer" userName="Buyer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commissioned Work</h1>
          <p className="text-gray-500">Request a custom upcycled artwork through RenewCanvas admin mediation.</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <p className="text-sm text-blue-700">
            Your request goes straight to admins. RenewCanvas selects and coordinates with an artist; buyer and artist contact details stay private.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          {error && <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">{error}</div>}
          {message && <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-sm text-green-700">{message}</div>}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Project title</label>
            <input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Describe what you want</label>
            <textarea id="description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Explain the product, purpose, style, deadline, and any important details." required />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="materials" className="block text-sm font-medium text-gray-700 mb-1">Preferred materials</label>
              <input id="materials" value={form.preferredMaterials} onChange={(e) => setForm({ ...form, preferredMaterials: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Plastic, metal, fabric..." />
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">Budget willing to pay (RWF)</label>
              <input id="budget" type="number" min="1" value={form.budgetAmount} onChange={(e) => setForm({ ...form, budgetAmount: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" required />
            </div>
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">Approximate size</label>
              <select id="size" value={form.sizeCategory} onChange={(e) => setForm({ ...form, sizeCategory: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                {sizeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>

          {form.sizeCategory === "custom" && (
            <div>
              <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1">Specific dimensions</label>
              <input id="dimensions" value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Example: 80cm x 120cm" required />
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50">
            <Send className="w-4 h-4" />
            {isSubmitting ? "Sending..." : "Send to Admin"}
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Your Requests</h2>
          {requests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{request.title}</p>
                  <p className="text-sm text-gray-500">{request.assignedArtist ? `Assigned to ${request.assignedArtist.name}` : "Awaiting admin assignment"}</p>
                </div>
                <span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">{request.status}</span>
              </div>
              <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2"><DollarSign className="w-4 h-4" /> {request.budgetAmount.toLocaleString()} {request.currency}</span>
                <span className="inline-flex items-center gap-2"><Ruler className="w-4 h-4" /> {request.dimensions ?? request.sizeCategory}</span>
                <span className="inline-flex items-center gap-2"><ClipboardList className="w-4 h-4" /> {new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
