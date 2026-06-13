/**
 * Per-user notification preferences.
 *
 * Stored as a single JSON blob on User.notificationPrefs (one migration, all
 * keys) rather than separate columns. Every key defaults to ON: a missing blob
 * or missing key is treated as enabled, so existing users keep getting
 * notifications until they opt out.
 *
 * This module is the single chokepoint: every notification send checks the
 * matching pref here and skips if it's off.
 */

export const NOTIFICATION_PREF_KEYS = [
  // Email
  "emailNewOrders",
  "emailCommissionRequests",
  "emailArtworkStatus",
  "emailPayoutUpdates",
  "emailAuctionBids",
  "emailNewsletter",
  // Push (no provider yet — see sendPushNotification)
  "pushNewOrders",
  "pushCommissionRequests",
  "pushPayoutProcessed",
] as const;

export type NotificationPrefKey = (typeof NOTIFICATION_PREF_KEYS)[number];
export type NotificationPrefs = Record<NotificationPrefKey, boolean>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = NOTIFICATION_PREF_KEYS.reduce(
  (acc, key) => {
    acc[key] = true;
    return acc;
  },
  {} as NotificationPrefs
);

export type NotificationPrefsDatabase = {
  user: {
    findUnique(args: {
      where: { id: string };
      select: { notificationPrefs: true };
    }): Promise<{ notificationPrefs: unknown } | null>;
    update(args: {
      where: { id: string };
      data: { notificationPrefs: unknown };
    }): Promise<unknown>;
  };
};

/** Merge a raw stored blob with the defaults so every key is a concrete boolean. */
export function normalizeNotificationPrefs(raw: unknown): NotificationPrefs {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out = {} as NotificationPrefs;
  for (const key of NOTIFICATION_PREF_KEYS) {
    out[key] = typeof obj[key] === "boolean" ? (obj[key] as boolean) : true;
  }
  return out;
}

/** Keep only known boolean keys from an arbitrary client payload. */
export function pickNotificationPrefs(input: Record<string, unknown>): Partial<NotificationPrefs> {
  const out: Partial<NotificationPrefs> = {};
  for (const key of NOTIFICATION_PREF_KEYS) {
    if (typeof input[key] === "boolean") out[key] = input[key] as boolean;
  }
  return out;
}

export async function getNotificationPrefs(
  db: NotificationPrefsDatabase,
  userId: string
): Promise<NotificationPrefs> {
  const row = await db.user.findUnique({
    where: { id: userId },
    select: { notificationPrefs: true },
  });
  return normalizeNotificationPrefs(row?.notificationPrefs);
}

/** Merge a partial update into the stored prefs and persist; returns the merged set. */
export async function updateNotificationPrefs(
  db: NotificationPrefsDatabase,
  userId: string,
  partial: Record<string, unknown>
): Promise<NotificationPrefs> {
  const current = await getNotificationPrefs(db, userId);
  const next: NotificationPrefs = { ...current, ...pickNotificationPrefs(partial) };
  await db.user.update({ where: { id: userId }, data: { notificationPrefs: next } });
  return next;
}

/** Is a given notification type enabled for this user? Defaults to true. */
export async function isNotificationEnabled(
  db: NotificationPrefsDatabase,
  userId: string,
  key: NotificationPrefKey
): Promise<boolean> {
  try {
    const prefs = await getNotificationPrefs(db, userId);
    return prefs[key];
  } catch (error) {
    // Never let a prefs lookup failure block a transactional flow; default to
    // sending (the historical behaviour before prefs existed).
    console.error("isNotificationEnabled lookup failed; defaulting to enabled", { userId, key, error });
    return true;
  }
}

/**
 * Push notifications.
 *
 * There is NO push infrastructure (web-push / FCM / APNs) in this project yet.
 * We still honour the user's preference and provide a single typed entry point
 * so callers don't reach for a new service ad hoc.
 *
 * TODO(push): integrate a real provider here. Until then this only logs and
 * returns "stubbed" so the rest of the flow (and the pref gating) is real.
 */
export async function sendPushNotification(
  db: NotificationPrefsDatabase,
  userId: string,
  key: Extract<NotificationPrefKey, `push${string}`>,
  payload: { title: string; body: string }
): Promise<{ status: "sent" | "skipped" | "stubbed" }> {
  const enabled = await isNotificationEnabled(db, userId, key);
  if (!enabled) return { status: "skipped" };
  // TODO(push): replace with a real push provider call.
  console.info("[push:TODO] push notification suppressed — no provider configured", {
    userId,
    key,
    title: payload.title,
  });
  return { status: "stubbed" };
}
