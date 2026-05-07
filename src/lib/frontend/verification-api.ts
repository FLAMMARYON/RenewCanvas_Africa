export type VerificationItem = {
  id: string;
  artworkId: string;
  title: string;
  slug: string;
  artist: { id: string; name: string; email: string } | null;
  artworkStatus: string;
  reviewStatus: "pending" | "approved" | "rejected" | "more_info_requested";
  adminNotes: string | null;
  artistMessage: string | null;
  decidedAt: string | null;
  requestedInfoAt: string | null;
  recommendedAction: string | null;
  reviewFlags: string[];
  pricingStatus: "ready" | "missing";
  impactStatus: "ready" | "missing";
  museumStatus: "placed" | "missing";
  museumRoom: string | null;
  plainLanguageSummary: string;
  evidence: Array<{
    id: string;
    type: string;
    url: string;
    label: string;
    notes: string | null;
    createdAt: string;
  }>;
};

type VerificationResponse = {
  ok: boolean;
  items: VerificationItem[];
  message?: string;
};

export async function listVerificationItems() {
  const response = await fetch("/api/verification", { credentials: "include" });
  const payload = (await response.json()) as VerificationResponse;
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not load verification queue.");
  return payload.items;
}

export async function decideVerification(
  artworkId: string,
  decision: "approve" | "reject" | "request_more_info",
  note?: string
) {
  const response = await fetch(`/api/verification/${encodeURIComponent(artworkId)}/decision`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ decision, note }),
  });
  const payload = (await response.json()) as { ok: boolean; message?: string };
  if (!response.ok || !payload.ok) throw new Error(payload.message ?? "Could not save verification decision.");
}

export async function submitVerificationEvidence(
  artworkId: string,
  payload: { type?: string; url: string; label: string; notes?: string }
) {
  const response = await fetch(`/api/verification/${encodeURIComponent(artworkId)}/evidence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { ok: boolean; message?: string };
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not submit verification evidence.");
}
