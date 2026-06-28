import { createAuthClient } from "better-auth/react";

/**
 * Browser-side Better Auth client. Used by client components (e.g. the login
 * form and the sign-out button). Same-origin by default, so no baseURL needed.
 */
export const authClient = createAuthClient();

export const { signIn, signOut, signUp, useSession } = authClient;
