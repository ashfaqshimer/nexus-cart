/**
 * Pure, I/O-free validation shared by the admin image-upload route handler.
 * Kept server-agnostic (no `server-only`) so it can be unit-tested in isolation.
 */

/** Image MIME types the upload endpoint accepts. */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

/** Maximum upload size, in bytes (5 MB). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type UploadValidation =
  | { ok: true }
  | { ok: false; status: number; error: string };

/**
 * Validate an uploaded file's type and size. Returns the HTTP status the route
 * should respond with on failure (`415` wrong type, `413` too large, `400`
 * missing/empty).
 */
export function validateUploadFile(file: File | null): UploadValidation {
  if (!file || file.size === 0) {
    return { ok: false, status: 400, error: "No file was provided." };
  }
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return {
      ok: false,
      status: 415,
      error: "Unsupported file type. Use JPEG, PNG, WebP, GIF, or AVIF.",
    };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      status: 413,
      error: `File is too large. Maximum size is ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`,
    };
  }
  return { ok: true };
}
