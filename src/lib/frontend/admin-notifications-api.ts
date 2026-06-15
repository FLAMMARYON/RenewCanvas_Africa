export type AdminNotification = {
  id: string;
  templateKey: string;
  subject: string | null;
  body: string;
  metadata: unknown;
  read: boolean;
  createdAt: string;
};

type Response = { ok: boolean; notifications: AdminNotification[]; message?: string };

export async function listAdminNotifications(): Promise<AdminNotification[]> {
  const response = await fetch("/api/admin/notifications", { credentials: "include" });
  const body = (await response.json()) as Response;
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not load notifications.");
  return body.notifications;
}

export async function markAdminNotificationRead(input: { id?: string; all?: boolean }): Promise<AdminNotification[]> {
  const response = await fetch("/api/admin/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const body = (await response.json()) as Response;
  if (!response.ok || !body.ok) throw new Error(body.message ?? "Could not update notification.");
  return body.notifications;
}
