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
  "image/png",
  "image/webp",
  "image/gif",
];

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
    throw new AuthError(
      "storage_not_configured",
      "Image storage is not configured. Contact support.",
      503
    );
  }

  if (!ALLOWED_CONTENT_TYPES.includes(options.contentType)) {
    throw new AuthError(
      "invalid_media_type",
      `File type ${options.contentType} is not allowed. Use JPEG, PNG, WebP, or GIF.`,
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

  const blob = await put(pathname, fileData, {
    access: "public",
    contentType: options.contentType,
    token: blobToken,
  });

  return {
    provider: "vercel_blob",
    storageKey: blob.pathname,
    publicUrl: blob.url,
    contentType: options.contentType,
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
