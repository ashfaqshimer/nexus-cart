import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth";

// Better Auth's catch-all handler — serves all /api/auth/* endpoints (sign-in,
// sign-up, sign-out, get-session, …) on the Node runtime.
export const { GET, POST } = toNextJsHandler(auth);
