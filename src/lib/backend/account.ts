import { AuthError, type AuthPublicUser, normalizeEmail } from "./auth";
import type { PrismaClient } from "@prisma/client";

/**
 * Change the signed-in user's email. Validates format + uniqueness.
 */
export async function changeUserEmail(db: PrismaClient, user: AuthPublicUser, newEmailRaw: string): Promise<string> {
  const email = normalizeEmail(newEmailRaw);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthError("invalid_email", "Enter a valid email address.", 400);
  }
  if (email === user.email) {
    throw new AuthError("email_unchanged", "That is already your email address.", 400);
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing && existing.id !== user.id) {
    throw new AuthError("email_taken", "That email is already in use.", 409);
  }
  await db.user.update({ where: { id: user.id }, data: { email } });
  await db.auditLog.create({
    data: { actorId: user.id, action: "account.email.changed", entity: "User", entityId: user.id },
  });
  return email;
}

/**
 * Permanently delete an artist's personal data: profile (incl. payout info),
 * deletable artworks (those with no order history), wishlist, notifications,
 * and analytics; then anonymise and deactivate the account and revoke sessions.
 *
 * Completed order records are retained (referential integrity / the buyer's and
 * admin's records), but the artist's identity and payout details are purged and
 * the account can no longer sign in.
 */
export async function deleteArtistAccount(db: PrismaClient, user: AuthPublicUser): Promise<void> {
  await db.$transaction(async (tx) => {
    // Artworks with no order items can be hard-deleted; sold/ordered ones must
    // remain referenced, so unlist them.
    await tx.artwork.deleteMany({ where: { artistId: user.id, orderItems: { none: {} } } });
    await tx.artwork.updateMany({ where: { artistId: user.id }, data: { status: "archived" } });

    // Remove personal/profile data.
    await tx.artistProfile.deleteMany({ where: { userId: user.id } });
    await tx.notificationPreference.deleteMany({ where: { userId: user.id } });
    await tx.notification.deleteMany({ where: { userId: user.id } });
    await tx.wishlistItem.deleteMany({ where: { buyerId: user.id } });
    await tx.analyticsEvent.deleteMany({ where: { userId: user.id } });
    await tx.virtualRoomState.deleteMany({ where: { userId: user.id } });

    // Anonymise + deactivate the account; revoke all sessions.
    await tx.user.update({
      where: { id: user.id },
      data: {
        email: `deleted-${user.id}@deleted.invalid`,
        name: "Deleted artist",
        passwordHash: null,
        status: "deleted",
        deletedAt: new Date(),
      },
    });
    await tx.authSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });

    await tx.auditLog.create({
      data: { actorId: user.id, action: "account.deleted", entity: "User", entityId: user.id },
    });
  });
}

/**
 * Delete a buyer's account. Uses the soft-delete / anonymise approach
 * consistently for every buyer (FK-safe regardless of history): personal data
 * that no one else needs is removed, but orders, payments, shipments,
 * commissions, bids, and return requests are RETAINED — artists and admins still
 * need that purchase history. The account is then anonymised + deactivated and
 * all sessions revoked, so the credentials can no longer sign in.
 *
 * This avoids the foreign-key constraint error a naive db.user.delete() would
 * throw against the Restrict relations (Order/Payment/Shipment/Commission/etc.)
 * and never leaves orphaned rows. Runs in a $transaction so a partial failure
 * rolls back.
 */
export async function deleteBuyerAccount(db: PrismaClient, user: AuthPublicUser): Promise<void> {
  await db.$transaction(async (tx) => {
    // Personal data that only the buyer needs — safe to hard-delete.
    await tx.wishlistItem.deleteMany({ where: { buyerId: user.id } });
    await tx.notification.deleteMany({ where: { userId: user.id } });
    await tx.notificationPreference.deleteMany({ where: { userId: user.id } });
    await tx.analyticsEvent.deleteMany({ where: { userId: user.id } });
    await tx.virtualRoomState.deleteMany({ where: { userId: user.id } });
    await tx.address.deleteMany({ where: { userId: user.id } });
    await tx.buyerProfile.deleteMany({ where: { userId: user.id } });

    // Anonymise + deactivate; revoke all sessions. Orders/payments/commissions
    // remain referenced and intact.
    await tx.user.update({
      where: { id: user.id },
      data: {
        email: `deleted-${user.id}@deleted.invalid`,
        name: "Deleted user",
        passwordHash: null,
        status: "deleted",
        deletedAt: new Date(),
      },
    });
    await tx.authSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });

    await tx.auditLog.create({
      data: { actorId: user.id, action: "account.deleted", entity: "User", entityId: user.id },
    });
  });
}
