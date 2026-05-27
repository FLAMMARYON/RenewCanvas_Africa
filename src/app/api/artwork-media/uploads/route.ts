import { NextResponse, type NextRequest } from "next/server";
import { AuthError, requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { isStorageConfigured, uploadFile, validateFileSize } from "@/lib/backend/storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const db = getDatabaseClient();
    const sessionCookie = readSessionCookie(request);

    try {
      await requireRole(db, sessionCookie, ["artist", "admin"]);
    } catch (error) {
      console.error("Artwork media upload auth failed:", {
        hasSessionCookie: Boolean(sessionCookie),
        code: error instanceof AuthError ? error.code : "unknown",
        status: error instanceof AuthError ? error.status : undefined,
        error,
      });
      throw error;
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, message: "No file provided." },
        { status: 400 }
      );
    }

    if (!isStorageConfigured()) {
      const message = "Image storage is not configured. Missing BLOB_READ_WRITE_TOKEN.";
      console.error("Artwork media upload storage configuration failed:", {
        code: "storage_not_configured",
        message,
      });
      return NextResponse.json(
        { ok: false, code: "storage_not_configured", message },
        { status: 503 }
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
    console.error("Artwork media upload failed:", {
      code: error instanceof AuthError ? error.code : "unknown",
      status: error instanceof AuthError ? error.status : undefined,
      error,
    });
    return authErrorResponse(error);
  }
}
