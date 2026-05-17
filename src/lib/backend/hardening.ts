import { AuthError, type AuthPublicUser } from "./auth";

export type HardeningDatabase = {
  user: {
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
  };
  securityEvent: {
    create(args: { data: Record<string, unknown> }): Promise<unknown>;
  };
};

export function assertCsrfToken(cookieToken: string | undefined, headerToken: string | null) {
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new AuthError("csrf_failed", "Security token is invalid or expired.", 403);
  }
}

export async function recordSecurityEvent(
  db: HardeningDatabase,
  input: { actorId?: string; eventType: string; severity?: "info" | "warning" | "critical"; ipAddress?: string; userAgent?: string; metadata?: unknown }
) {
  return db.securityEvent.create({
    data: {
      actorId: input.actorId,
      eventType: input.eventType,
      severity: input.severity ?? "info",
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: input.metadata,
    },
  });
}

export async function acceptLegalTerms(db: HardeningDatabase, user: AuthPublicUser, now = new Date()) {
  await db.user.update({
    where: { id: user.id },
    data: { termsAcceptedAt: now, privacyAcceptedAt: now },
  });
  await recordSecurityEvent(db, { actorId: user.id, eventType: "legal_terms.accepted", severity: "info" });
  return { termsAcceptedAt: now.toISOString(), privacyAcceptedAt: now.toISOString() };
}

export function validateUploadMetadata(input: { contentType?: string; sizeBytes?: number }) {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!input.contentType || !allowed.has(input.contentType)) {
    throw new AuthError("unsupported_file_type", "Only JPEG, PNG, and WebP uploads are allowed.", 400);
  }
  if (!input.sizeBytes || input.sizeBytes <= 0 || input.sizeBytes > 10 * 1024 * 1024) {
    throw new AuthError("invalid_file_size", "Upload must be 10MB or smaller.", 400);
  }
  return { contentType: input.contentType, sizeBytes: input.sizeBytes };
}
