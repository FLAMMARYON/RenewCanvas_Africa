import { sendEmail } from "@/lib/backend/messaging-providers";
import { getSupportInboxEmail } from "@/lib/config/constants";

/**
 * Email-delivery abstraction for inbound form notifications.
 *
 * Recipients are: the support inbox (SUPPORT_INBOX_EMAIL) PLUS every active
 * admin user who has email notifications enabled. Admin recipients are read
 * from the DB — never hardcoded.
 *
 * Delivery is best-effort and isolated per recipient: one failure never blocks
 * the others or the originating request. Bodies are plain text (no raw user
 * HTML is ever rendered into an email).
 */

type NotifyDatabase = {
  user: {
    findMany(args: {
      where: Record<string, unknown>;
      select: { email: true };
    }): Promise<Array<{ email: string }>>;
  };
};

export type NotifyResult = {
  attempted: number;
  sent: number;
  recipients: string[];
};

export async function getAdminNotificationRecipients(db: NotifyDatabase): Promise<string[]> {
  try {
    const admins = await db.user.findMany({
      where: {
        role: "admin",
        status: "active",
        notificationPreference: { is: { emailEnabled: true } },
      },
      select: { email: true },
    });
    return admins.map((a) => a.email).filter(Boolean);
  } catch {
    // If the preference relation/query fails, fall back to no extra admins
    // (the support inbox still receives the message).
    return [];
  }
}

export async function notifySupportAndAdmins(
  db: NotifyDatabase,
  message: { subject: string; body: string }
): Promise<NotifyResult> {
  const supportInbox = getSupportInboxEmail();
  const adminEmails = await getAdminNotificationRecipients(db);

  // De-duplicate; the support inbox may itself belong to an admin user.
  const recipients = Array.from(new Set([supportInbox, ...adminEmails]));

  let sent = 0;
  for (const to of recipients) {
    try {
      const result = await sendEmail({ to, subject: message.subject, body: message.body });
      if (result.status === "sent") sent += 1;
    } catch (error) {
      console.error("notifySupportAndAdmins: delivery failed", { to, error });
    }
  }

  return { attempted: recipients.length, sent, recipients };
}
