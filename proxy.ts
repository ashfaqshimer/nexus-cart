import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic auth gate — NOT the security boundary. This only checks for the
 * presence of the Better Auth session cookie to redirect early; it does not
 * verify the session or the user's role. The authoritative check is
 * `requireAdmin()` in `app/admin/layout.tsx` and in every admin Server Action.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged-in users have no reason to see the auth pages.
  if ((pathname === "/login" || pathname === "/signup") && sessionCookie) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/signup"],
};
