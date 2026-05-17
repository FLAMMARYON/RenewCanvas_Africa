/**
 * High-level notification service that queues and dispatches emails.
 * Wraps the low-level notification and messaging-provider modules.
 */

import { queueNotification, dispatchQueuedNotifications, type NotificationDatabase } from "./notifications";
import {
  orderConfirmationEmail,
  newOrderAlertEmail,
  artworkDecisionEmail,
  passwordResetEmail,
  type OrderConfirmationInput,
  type NewOrderAlertInput,
  type ArtworkDecisionInput,
  type PasswordResetInput,
} from "./email-templates";
import { requireBackendConfig } from "./config";

export type NotificationServiceDatabase = NotificationDatabase;

/**
 * Send order confirmation email to buyer and dispatch immediately.
 */
export async function sendOrderConfirmationEmail(
  db: NotificationServiceDatabase,
  buyerId: string,
  input: OrderConfirmationInput
) {
  const config = requireBackendConfig();
  const emailInput = { ...input, siteUrl: config.siteUrl };
  const template = orderConfirmationEmail(emailInput);

  const notification = await queueNotification(db, {
    userId: buyerId,
    channel: "email",
    templateKey: "order_confirmation",
    subject: template.subject,
    body: template.body,
    metadata: { orderId: input.orderId, artworkTitle: input.artworkTitle },
    category: "orderUpdates",
  });

  if (notification.status === "queued") {
    await dispatchQueuedNotifications(db, { limit: 1 });
  }

  return notification;
}

/**
 * Send new order alert email to artist and dispatch immediately.
 */
export async function sendNewOrderAlertEmail(
  db: NotificationServiceDatabase,
  artistId: string,
  input: NewOrderAlertInput
) {
  const config = requireBackendConfig();
  const emailInput = { ...input, siteUrl: config.siteUrl };
  const template = newOrderAlertEmail(emailInput);

  const notification = await queueNotification(db, {
    userId: artistId,
    channel: "email",
    templateKey: "new_order_alert",
    subject: template.subject,
    body: template.body,
    metadata: { orderId: input.orderId, artworkTitle: input.artworkTitle },
    category: "orderUpdates",
  });

  if (notification.status === "queued") {
    await dispatchQueuedNotifications(db, { limit: 1 });
  }

  return notification;
}

/**
 * Send artwork decision email to artist and dispatch immediately.
 */
export async function sendArtworkDecisionEmail(
  db: NotificationServiceDatabase,
  artistId: string,
  input: ArtworkDecisionInput
) {
  const config = requireBackendConfig();
  const emailInput = { ...input, siteUrl: config.siteUrl };
  const template = artworkDecisionEmail(emailInput);

  const notification = await queueNotification(db, {
    userId: artistId,
    channel: "email",
    templateKey: `artwork_${input.decision}`,
    subject: template.subject,
    body: template.body,
    metadata: { artworkId: input.artworkId, decision: input.decision },
    category: "moderation",
  });

  if (notification.status === "queued") {
    await dispatchQueuedNotifications(db, { limit: 1 });
  }

  return notification;
}

/**
 * Send password reset email and dispatch immediately.
 * Unlike other notifications, this doesn't require a userId in the notification table
 * because the user may not be logged in. We send directly via the provider.
 */
export async function sendPasswordResetEmail(
  db: NotificationServiceDatabase,
  userId: string,
  input: PasswordResetInput
) {
  const template = passwordResetEmail(input);

  const notification = await queueNotification(db, {
    userId,
    channel: "email",
    templateKey: "password_reset",
    subject: template.subject,
    body: template.body,
    metadata: { expiresInMinutes: input.expiresInMinutes },
  });

  if (notification.status === "queued") {
    await dispatchQueuedNotifications(db, { limit: 1 });
  }

  return notification;
}
