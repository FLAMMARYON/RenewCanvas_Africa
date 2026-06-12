import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { AuthError, requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { isStorageConfigured, uploadFile, validateFileSize } from "@/lib/backend/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/profile/avatar — multipart "file".
 * Resizes to a 400x400 square WebP avatar, uploads to the public Blob
 * "avatars" folder, saves the URL to ArtistProfile.avatarUrl, returns the URL.
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const user = await requireRole(db, readSessionCookie(request), ["artist", "admin", "buyer"]);

    if (!isStorageConfigured()) {
      return NextResponse.json(
        { ok: false, code: "storage_not_configured", message: "Image storage is not configured." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ ok: false, message: "No file provided." }, { status: 400 });
    }
    validateFileSize(file.size);

    const input = Buffer.from(await file.arrayBuffer());
    const buffer = await sharp(input)
      .rotate()
      .resize(400, 400, { fit: "cover", position: "centre" })
      .webp({ quality: 88 })
      .toBuffer();

    const result = await uploadFile(buffer, {
      filename: `avatar-${user.id}.webp`,
      contentType: "image/webp",
      folder: "avatars",
    });

    // Persist to the role profile's avatarUrl (artist/buyer profiles both have it).
    if (user.role === "artist") {
      await db.artistProfile.upsert({
        where: { userId: user.id },
        update: { avatarUrl: result.publicUrl },
        create: { userId: user.id, avatarUrl: result.publicUrl },
      });
    } else if (user.role === "buyer") {
      await db.buyerProfile.upsert({
        where: { userId: user.id },
        update: { avatarUrl: result.publicUrl },
        create: { userId: user.id, avatarUrl: result.publicUrl },
      });
    }

    return NextResponse.json({ ok: true, avatarUrl: result.publicUrl });
  } catch (error) {
    if (error instanceof AuthError) return authErrorResponse(error);
    console.error("Avatar upload failed:", error);
    return NextResponse.json(
      { ok: false, code: "upload_failed", message: "Avatar upload failed." },
      { status: 500 }
    );
  }
}
