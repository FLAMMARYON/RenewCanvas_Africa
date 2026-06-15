import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readJsonBody, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import {
  decideVerificationReview,
  type VerificationDatabase,
  type VerificationDecision,
} from "@/lib/backend/verification";
import { sendArtworkDecisionEmail, type NotificationServiceDatabase } from "@/lib/backend/notification-service";
import { notifyAdmins } from "@/lib/backend/admin-notifications";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ artworkId: string }> }
) {
  try {
    const db = getDatabaseClient();
    const admin = await requireRole(db, readSessionCookie(request), ["admin"]);
    const params = await context.params;
    const body = (await readJsonBody(request)) as Partial<{ decision: VerificationDecision; note: string }>;
    const result = await decideVerificationReview(db as unknown as VerificationDatabase, admin, {
      artworkId: params.artworkId,
      decision: body.decision ?? "request_more_info",
      note: body.note,
    });

    // Send artwork decision email to artist
    // Convert decision from action form to past tense for email template
    const emailDecision =
      result.decision === "approve" ? "approved" :
      result.decision === "reject" ? "rejected" : "more_info_requested";
    await sendArtworkDecisionEmail(db as unknown as NotificationServiceDatabase, result.artwork.artistId, {
      artistName: result.artwork.artistName,
      artworkTitle: result.artwork.title,
      artworkId: result.artwork.id,
      decision: emailDecision,
      adminNote: result.note ?? undefined,
    });

    // Admin push: artist/artwork verified.
    if (emailDecision === "approved") {
      await notifyAdmins(db, {
        templateKey: "admin_artist_verified",
        subject: "Artist verified",
        body: `${result.artwork.artistName}'s "${result.artwork.title}" was verified.`,
        metadata: { artworkId: result.artwork.id, artistId: result.artwork.artistId },
      });
    }

    return NextResponse.json({ ok: true, review: result.review });
  } catch (error) {
    return authErrorResponse(error);
  }
}
