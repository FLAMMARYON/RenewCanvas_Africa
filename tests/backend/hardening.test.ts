import assert from "node:assert/strict";
import test from "node:test";
import { AuthError } from "@/lib/backend/auth";
import { assertCsrfToken, validateUploadMetadata } from "@/lib/backend/hardening";

test("assertCsrfToken accepts a matching double-submit token", () => {
  assert.doesNotThrow(() => assertCsrfToken("token-abc", "token-abc"));
});

test("assertCsrfToken rejects missing or mismatched tokens", () => {
  assert.throws(() => assertCsrfToken(undefined, "token-abc"), AuthError);
  assert.throws(() => assertCsrfToken("token-abc", null), AuthError);
  assert.throws(() => assertCsrfToken("token-abc", "token-xyz"), AuthError);
});

test("validateUploadMetadata only allows safe image content types", () => {
  for (const contentType of ["image/jpeg", "image/png", "image/webp"]) {
    assert.deepEqual(validateUploadMetadata({ contentType, sizeBytes: 1024 }), {
      contentType,
      sizeBytes: 1024,
    });
  }
});

test("validateUploadMetadata blocks executables and unsupported types", () => {
  assert.throws(
    () => validateUploadMetadata({ contentType: "application/x-msdownload", sizeBytes: 10 }),
    /Only JPEG, PNG, and WebP/
  );
  assert.throws(
    () => validateUploadMetadata({ contentType: "text/html", sizeBytes: 10 }),
    /Only JPEG, PNG, and WebP/
  );
});

test("validateUploadMetadata enforces a non-empty size under 10MB", () => {
  assert.throws(() => validateUploadMetadata({ contentType: "image/png", sizeBytes: 0 }), /10MB/);
  assert.throws(
    () => validateUploadMetadata({ contentType: "image/png", sizeBytes: 10 * 1024 * 1024 + 1 }),
    /10MB/
  );
});
