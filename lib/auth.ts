import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/db";
import { account, session, user, verification } from "@/lib/db/schema";

/**
 * Server-only Better Auth instance. The `server-only` import keeps it (and the
 * secret) out of any client bundle — mirror `lib/stripe.ts`. The session/role
 * are read via `lib/auth-dal.ts`; the client lives in `lib/auth-client.ts`.
 *
 * `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are read from the environment.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      // Drives the admin gate. `input: false` means clients can't set it on
      // sign-up; an admin is promoted out of band (see lib/db/seed.ts).
      role: { type: "string", defaultValue: "user", input: false },
    },
  },
  // Must be last: lets Server Action sign-in/up set the session cookie.
  plugins: [nextCookies()],
});
