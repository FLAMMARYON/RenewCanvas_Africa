import { AuthError, type AuthPublicUser } from "./auth";
import { createMessagingProviderClient, type MessagingProviderClient } from "./messaging-providers";

export type NotificationChannel = "email" | "sms" | "whatsapp" | "in_app";
export type NotificationStatus = "queued" | "sent" | "failed" | "skipped";

export type NotificationRecord = {
  id: string;
  userId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  templateKey: string;
  subject: string | null;
  body: string;
  metadata: unknown;
  errorMessage: string | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: { email?: string | null; buyerProfile?: { phone?: string | null } | null; artistProfile?: { phone?: string | null } | null; adminProfile?: { phone?: string | null } | null } | null;
};

export type NotificationDatabase = {
  notificationPreference: {
    findUnique(args: { where: { userId: string } }): Promise<Record<string, unknown> | null>;
    upsert(args: { where: { userId: string }; update: Record<string, unknown>; create: Record<string, unknown> }): Promise<Record<string, unknown>>;
  };
  notification: {
    create(args: { data: Record<string, unknown> }): Promise<NotificationRecord>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<NotificationRecord>;
    findMany(args: { where: Record<string, unknown>; orderBy: { createdAt: "desc" }; include?: unknown }): Promise<NotificationRecord[]>;
  };
};

export async function queueNotification(
  db: NotificationDatabase,
  input: {
    userId: string;
    channel: NotificationChannel;
    templateKey: string;
    subject?: string;
    body: string;
    metadata?: unknown;
    category?: "orderUpdates" | "moderation" | "auctions" | "marketing";
  }
) {
  const preference = await db.notificationPreference.findUnique({ where: { userId: input.userId } });
  const skipped = preference ? !isChannelEnabled(preference, input.channel) || !isCategoryEnabled(preference, input.category) : false;
  return normalizeNotification(
    await db.notification.create({
      data: {
        userId: input.userId,
        channel: input.channel,
        status: skipped ? "skipped" : "queued",
        templateKey: input.templateKey,
        subject: cleanText(input.subject, 160),
        body: input.body.slice(0, 2000),
        metadata: input.metadata,
      },
    })
  );
}

export async function markNotificationSent(db: NotificationDatabase, notificationId: string, now = new Date()) {
  return normalizeNotification(await db.notification.update({ where: { id: notificationId }, data: { status: "sent", sentAt: now } }));
}

export async function updateNotificationPreferences(db: NotificationDatabase, user: AuthPublicUser, input: Record<string, unknown>) {
  const data = {
    emailEnabled: booleanValue(input.emailEnabled, true),
    smsEnabled: booleanValue(input.smsEnabled, false),
    whatsappEnabled: booleanValue(input.whatsappEnabled, false),
    orderUpdates: booleanValue(input.orderUpdates, true),
    moderation: booleanValue(input.moderation, true),
    auctions: booleanValue(input.auctions, true),
    marketing: booleanValue(input.marketing, false),
  };
  return db.notificationPreference.upsert({ where: { userId: user.id }, update: data, create: { userId: user.id, ...data } });
}

export async function listNotifications(db: NotificationDatabase, user: AuthPublicUser) {
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return notifications.map(normalizeNotification);
}

export async function dispatchQueuedNotifications(
  db: NotificationDatabase,
  options: { limit?: number; provider?: MessagingProviderClient; now?: Date } = {}
) {
  const notifications = await db.notification.findMany({
    where: { status: "queued" },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          buyerProfile: { select: { phone: true } },
          artistProfile: { select: { phone: true } },
          adminProfile: { select: { phone: true } },
        },
      },
    },
  });
  const provider = options.provider ?? createMessagingProviderClient();
  const now = options.now ?? new Date();
  const results = [];

  for (const notification of notifications.slice(0, options.limit ?? 25)) {
    const result = await provider.send({
      channel: notification.channel,
      to: recipientFor(notification),
      subject: notification.subject,
      body: notification.body,
    });
    const updated = await db.notification.update({
      where: { id: notification.id },
      data: {
        status: result.status,
        sentAt: result.status === "sent" ? now : notification.sentAt,
        errorMessage: result.errorMessage,
        metadata: mergeMetadata(notification.metadata, { providerReference: result.providerReference }),
      },
    });
    results.push(normalizeNotification(updated));
  }

  return results;
}

function normalizeNotification(notification: NotificationRecord) {
  return {
    id: notification.id,
    userId: notification.userId,
    channel: notification.channel,
    status: notification.status,
    templateKey: notification.templateKey,
    subject: notification.subject,
    body: notification.body,
    sentAt: notification.sentAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

function recipientFor(notification: NotificationRecord) {
  if (notification.channel === "email") return notification.user?.email ?? undefined;
  return (
    notification.user?.buyerProfile?.phone ??
    notification.user?.artistProfile?.phone ??
    notification.user?.adminProfile?.phone ??
    undefined
  );
}

function mergeMetadata(current: unknown, extra: Record<string, unknown>) {
  const base = typeof current === "object" && current !== null ? current : {};
  return { ...base, ...extra };
}

function isChannelEnabled(preference: Record<string, unknown>, channel: NotificationChannel) {
  if (channel === "email") return preference.emailEnabled !== false;
  if (channel === "sms") return preference.smsEnabled === true;
  if (channel === "whatsapp") return preference.whatsappEnabled === true;
  return true;
}

function isCategoryEnabled(preference: Record<string, unknown>, category?: string) {
  if (!category) return true;
  return preference[category] !== false;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

export { AuthError };
