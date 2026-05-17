export type UploadResult = {
  provider: string;
  storageKey: string;
  publicUrl: string;
  contentType: string;
  size: number;
};

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

/**
 * Upload a file to the server.
 * Returns the permanent public URL for the uploaded file.
 */
export async function uploadArtworkImage(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.ok) {
            resolve(response.upload);
          } else {
            reject(new Error(response.message ?? "Upload failed"));
          }
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          reject(
            new Error(response.message ?? `Upload failed with status ${xhr.status}`)
          );
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    xhr.open("POST", "/api/artwork-media/uploads");
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}

/**
 * Upload multiple files with progress tracking.
 */
export async function uploadArtworkImages(
  files: File[],
  onFileProgress?: (index: number, progress: UploadProgress) => void,
  onFileComplete?: (index: number, result: UploadResult) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadArtworkImage(files[i], (progress) =>
      onFileProgress?.(i, progress)
    );
    results.push(result);
    onFileComplete?.(i, result);
  }

  return results;
}
