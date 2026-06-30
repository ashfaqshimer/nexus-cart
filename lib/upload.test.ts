import { describe, expect, it } from "vitest";

import { MAX_UPLOAD_BYTES, validateUploadFile } from "@/lib/upload";

/** Build a File of `size` bytes with the given MIME type. */
function fakeFile(type: string, size: number): File {
  return new File([new Uint8Array(size)], "image", { type });
}

describe("validateUploadFile", () => {
  it("accepts an allowed image type within the size limit", () => {
    expect(validateUploadFile(fakeFile("image/png", 1024))).toEqual({
      ok: true,
    });
  });

  it("rejects a missing file with 400", () => {
    expect(validateUploadFile(null)).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects an empty file with 400", () => {
    expect(validateUploadFile(fakeFile("image/png", 0))).toMatchObject({
      ok: false,
      status: 400,
    });
  });

  it("rejects an unsupported type with 415", () => {
    expect(validateUploadFile(fakeFile("text/plain", 1024))).toMatchObject({
      ok: false,
      status: 415,
    });
  });

  it("rejects a file larger than the limit with 413", () => {
    expect(
      validateUploadFile(fakeFile("image/jpeg", MAX_UPLOAD_BYTES + 1)),
    ).toMatchObject({ ok: false, status: 413 });
  });
});
