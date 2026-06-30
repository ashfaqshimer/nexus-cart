import { put } from "@vercel/blob";

import { getCurrentSession } from "@/lib/auth-dal";
import { validateUploadFile } from "@/lib/upload";

/**
 * Admin image upload. The product form POSTs a single `file` here and stores the
 * returned public URL in the product's `images` array.
 *
 * Authorization is the real security boundary for this endpoint — we read the
 * session directly and return 401/403 JSON rather than calling `requireAdmin()`,
 * because its `redirect()` would send 307 HTML that the client `fetch()` would
 * follow and then fail to parse.
 *
 * Default Node runtime (needed by the session read and the Blob SDK).
 *
 * SWAP POINT: storage is Vercel Blob. To move to S3 / UploadThing / Cloudinary,
 * replace the `put()` call below — nothing else in the app needs to change, since
 * we persist whatever public URL this returns.
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return Response.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");

  const fileOrNull = file instanceof File ? file : null;
  const validation = validateUploadFile(fileOrNull);
  if (!validation.ok) {
    return Response.json(
      { error: validation.error },
      { status: validation.status },
    );
  }

  try {
    const blob = await put(fileOrNull!.name, fileOrNull!, {
      access: "public",
      addRandomSuffix: true,
    });
    return Response.json({ url: blob.url });
  } catch {
    return Response.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
