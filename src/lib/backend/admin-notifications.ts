/**
 * Admin in-app notifications ("push" alerts).
 *
 * Operational events (new registration, new order, new artwork submission,
 * artist verified, …) call `notifyAdmins()` which writes one in-app Notification
 * row per active admin. The admin notifications page (/dashboard/admin/
 * notifications) lists them so a missed push can still be seen later, and they
 * can be marked read/unread.
 */
import { Prisma, type PrismaClient } from "@prisma/client";

export type AdminNotificationInput = {
  templateKey: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
};

export type AdminNotificationView = {
  id: string;
  templateKey: string;
  subject: string | null;
  body: string;
  metadata: unknown;
  read: boolean;
  createdAt: string;
};

/** Fan an operational event out to every active admin as an in-app notification. */
export async function notifyAdmins(db: PrismaClient, input: AdminNotificationInput): Promise<void> {
  try {
    const admins = await db.user.findMany({ where: { role: "admin", status: "active" }, select: { id: true } });
    if (admins.length === 0) return;
    await db.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        channel: "in_app" as const,
        status: "sent" as const,
        templateKey: input.templateKey,
        subject: input.subject.slice(0, 160),
        body: input.body.slice(0, 2000),
        metadata: (input.metadata ?? Prisma.JsonNull) as Prisma.InputJsonValue,
        sentAt: new Date(),
      })),
    });
  } catch (error) {
    // Never let a notification failure break the underlying business action.
    console.error("notifyAdmins failed", { templateKey: input.templateKey, error });
  }
}

export async function listAdminNotifications(db: PrismaClient, userId: string): Promise<AdminNotificationView[]> {
  const rows = await db.notification.findMany({
    where: { userId, channel: "in_app" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map((row) => ({
    id: row.id,
    templateKey: row.templateKey,
    subject: row.subject,
    body: row.body,
    metadata: row.metadata,
    read: row.readAt != null,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function markAdminNotificationRead(
  db: PrismaClient,
  userId: string,
  input: { id?: string; all?: boolean }
): Promise<void> {
  if (input.all) {
    await db.notification.updateMany({ where: { userId, channel: "in_app", readAt: null }, data: { readAt: new Date() } });
    return;
  }
  if (input.id) {
    await db.notification.updateMany({ where: { id: input.id, userId }, data: { readAt: new Date() } });
  }
}
