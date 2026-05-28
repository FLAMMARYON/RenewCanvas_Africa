import { put, del } from "@vercel/blob";
import { AuthError } from "./auth";

export type StorageProvider = "vercel_blob" | "placeholder";

export type UploadResult = {
  provider: StorageProvider;
  storageKey: string;
  publicUrl: string;
  contentType: string;
  size: number;
};

export type UploadOptions = {
  filename: string;
  contentType: string;
  folder?: string;
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const BLOB_STORAGE_MISSING_MESSAGE =
  "Image storage is not configured. Missing BLOB_READ_WRITE_TOKEN.";

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.warn(BLOB_STORAGE_MISSING_MESSAGE);
}

export function isStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Infer MIME type from filename extension as a fallback
 * when the browser does not send a content type.
 */
function inferContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return map[ext] ?? "";
}

/**
 * Upload a file to Vercel Blob storage.
 * Returns the storage key and public URL for database persistence.
 */
export async function uploadFile(
  fileData: Buffer | Blob | ReadableStream,
  options: UploadOptions
): Promise<UploadResult> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    console.error(BLOB_STORAGE_MISSING_MESSAGE);
    throw new AuthError(
      "storage_not_configured",
      BLOB_STORAGE_MISSING_MESSAGE,
      503
    );
  }

  // Normalise content type — browsers may send empty string, "image/jpg",
  // or mixed-case values (common on Android and some iOS browsers).
  const normalizedType = options.contentType.toLowerCase().trim();
  const resolvedType = normalizedType || inferContentType(options.filename);

  if (!ALLOWED_CONTENT_TYPES.includes(resolvedType)) {
    throw new AuthError(
      "invalid_media_type",
      `File type "${resolvedType || "unknown"}" is not allowed. Use JPEG, PNG, WebP, or GIF.`,
      400
    );
  }

  // Compute file size from input
  let fileSize = 0;
  if (Buffer.isBuffer(fileData)) {
    fileSize = fileData.byteLength;
  } else if (fileData instanceof Blob) {
    fileSize = fileData.size;
  }

  // Sanitize filename
  const safeFilename = options.filename
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(0, 100);

  // Create path with folder prefix
  const folder = options.folder ?? "artworks";
  const timestamp = Date.now();
  const pathname = `${folder}/${timestamp}-${safeFilename}`;

  let blob;
  try {
    blob = await put(pathname, fileData, {
      access: "public",
      contentType: resolvedType,
      token: blobToken,
    });
  } catch (error) {
    console.error("Blob storage upload failed:", error);
    throw new AuthError(
      "storage_upload_failed",
      "Image storage could not save this file. Check BLOB_READ_WRITE_TOKEN and storage provider configuration.",
      502
    );
  }

  return {
    provider: "vercel_blob",
    storageKey: blob.pathname,
    publicUrl: blob.url,
    contentType: resolvedType,
    size: fileSize,
  };
}

/**
 * Delete a file from Vercel Blob storage.
 * Safe to call even if file doesn't exist.
 */
export async function deleteFile(publicUrl: string): Promise<void> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken) {
    return;
  }

  try {
    await del(publicUrl, { token: blobToken });
  } catch (error) {
    console.error("Failed to delete blob:", publicUrl, error);
  }
}

/**
 * Delete multiple files from Vercel Blob storage.
 */
export async function deleteFiles(publicUrls: string[]): Promise<void> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!blobToken || publicUrls.length === 0) {
    return;
  }

  const blobUrls = publicUrls.filter((url) => isVercelBlobUrl(url));

  if (blobUrls.length === 0) {
    return;
  }

  try {
    await del(blobUrls, { token: blobToken });
  } catch (error) {
    console.error("Failed to delete blobs:", error);
  }
}

/**
 * Validate file size from request.
 */
export function validateFileSize(sizeBytes: number): void {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new AuthError(
      "file_too_large",
      `File size exceeds maximum of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
      400
    );
  }
}

/**
 * Check if a URL is from Vercel Blob storage.
 */
export function isVercelBlobUrl(url: string): boolean {
  return (
    url.includes(".public.blob.vercel-storage.com") ||
    url.includes(".vercel-blob.com")
  );
}
