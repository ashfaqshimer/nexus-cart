import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

/**
 * Read the current Better Auth session on the server. Wrapped in React `cache()`
 * so multiple calls within one request (layout + page + action) hit the session
 * lookup once. Returns `{ session, user } | null`.
 */
export const getCurrentSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Authoritative admin gate for Server Components and Server Actions. This — not
 * `proxy.ts` — is the real security boundary: the proxy check is only an
 * optimistic redirect and can be bypassed. Redirects unauthenticated users to
 * /login and non-admins to the home page; otherwise returns the session.
 */
export async function requireAdmin() {
  const data = await getCurrentSession();
  if (!data) redirect("/login");
  if (data.user.role !== "admin") redirect("/");
  return data;
}
