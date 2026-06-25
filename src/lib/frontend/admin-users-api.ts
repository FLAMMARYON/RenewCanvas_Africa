export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  verified: boolean;
  joinedAt: string;
  artworksCount: number;
  ordersCount: number;
  // Artist MoMo payout details (null for buyers / not yet set).
  payoutMethod: string | null;
  payoutAccountName: string | null;
  payoutNumber: string | null;
};

type ListResponse = { ok: boolean; users: AdminUser[]; message?: string };
type MutateResponse = { ok: boolean; id?: string; status?: string; message?: string };

export async function listAdminUsers(): Promise<AdminUser[]> {
  const response = await fetch("/api/admin/users", { credentials: "include" });
  const body = (await response.json()) as ListResponse;
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not load users.");
  return body.users;
}

export async function setUserStatus(id: string, action: "suspend" | "activate"): Promise<string> {
  const response = await fetch("/api/admin/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id, action }),
  });
  const body = (await response.json()) as MutateResponse;
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not update user.");
  return body.status ?? (action === "suspend" ? "suspended" : "active");
}

/** Send a single user an email via the Resend pipeline (admin only). */
export async function emailUser(id: string, subject: string, message: string): Promise<void> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id, subject, message }),
  });
  const body = (await response.json()) as { ok: boolean; message?: string };
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not send the email.");
}
