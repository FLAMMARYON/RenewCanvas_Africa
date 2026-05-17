import { NextResponse, type NextRequest } from "next/server";
import { requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { uploadFile, validateFileSize } from "@/lib/backend/storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    await requireRole(db, readSessionCookie(request), ["artist", "admin"]);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, message: "No file provided." },
        { status: 400 }
      );
    }

    // Validate file size
    validateFileSize(file.size);

    // Upload to Vercel Blob
    const result = await uploadFile(file, {
      filename: file.name,
      contentType: file.type,
      folder: "artworks",
    });

    return NextResponse.json({
      ok: true,
      upload: {
        provider: result.provider,
        storageKey: result.storageKey,
        publicUrl: result.publicUrl,
        contentType: result.contentType,
        size: result.size,
      },
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
