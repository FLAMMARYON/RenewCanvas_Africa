import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { AuthError, requireRole } from "@/lib/backend/auth";
import { authErrorResponse, readSessionCookie } from "@/lib/backend/auth-route";
import { getDatabaseClient } from "@/lib/backend/db";
import { isStorageConfigured, uploadFile, validateFileSize } from "@/lib/backend/storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function logUploadStep(step: string, details?: Record<string, unknown>) {
  console.info("Artwork media upload step:", { step, ...details });
}

function uploadErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return authErrorResponse(error);
  }

  console.error("Artwork media upload unexpected error:", error);
  return NextResponse.json(
    {
      ok: false,
      code: "upload_failed",
      message: "Image upload failed before the file could be saved. Check server logs for the exact storage or database error.",
    },
    { status: 500 }
  );
}

function webpFilename(filename: string): string {
  const trimmed = filename.trim() || "artwork-image";
  const withoutExtension = trimmed.replace(/\.[^.]*$/, "");
  return `${withoutExtension || "artwork-image"}.webp`;
}

async function resizeArtworkImage(file: File): Promise<{
  buffer: Buffer;
  filename: string;
  contentType: "image/webp";
}> {
  const input = Buffer.from(await file.arrayBuffer());
  const buffer = await sharp(input)
    .rotate()
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();

  return {
    buffer,
    filename: webpFilename(file.name),
    contentType: "image/webp",
  };
}

export async function POST(request: NextRequest) {
  try {
    logUploadStep("create_database_client:start");
    const db = getDatabaseClient();
    logUploadStep("create_database_client:success");

    const sessionCookie = readSessionCookie(request);
    logUploadStep("read_session_cookie", {
      hasSessionCookie: Boolean(sessionCookie),
    });

    try {
      logUploadStep("require_role:start");
      await requireRole(db, sessionCookie, ["artist", "admin"]);
      logUploadStep("require_role:success");
    } catch (error) {
      console.error("Artwork media upload auth failed:", {
        hasSessionCookie: Boolean(sessionCookie),
        code: error instanceof AuthError ? error.code : "unknown",
        status: error instanceof AuthError ? error.status : undefined,
        error,
      });
      throw error;
    }

    logUploadStep("read_form_data:start");
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    logUploadStep("read_form_data:success", {
      hasFile: Boolean(file),
      filename: file?.name,
      fileType: file?.type || "(empty)",
      fileSize: file?.size,
    });

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
    logUploadStep("validate_file_size:start", { fileSize: file.size });
    validateFileSize(file.size);
    logUploadStep("validate_file_size:success");

    logUploadStep("resize_image:start", {
      filename: file.name,
      fileType: file.type || "(empty)",
    });
    const resized = await resizeArtworkImage(file);
    logUploadStep("resize_image:success", {
      filename: resized.filename,
      contentType: resized.contentType,
      size: resized.buffer.byteLength,
    });

    // Upload to Vercel Blob
    logUploadStep("upload_file:start", {
      filename: resized.filename,
      fileType: resized.contentType,
    });
    const result = await uploadFile(resized.buffer, {
      filename: resized.filename,
      contentType: resized.contentType,
      folder: "artworks",
    });
    logUploadStep("upload_file:success", {
      provider: result.provider,
      contentType: result.contentType,
      size: result.size,
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
    return uploadErrorResponse(error);
  }
}
