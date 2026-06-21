import "server-only";

import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

/**
 * Server-only Stripe client. The `server-only` import guarantees this module
 * (and the secret key) can never be pulled into a client bundle. Use Stripe's
 * test keys + test cards locally — see the checkout flow docs.
 */
export const stripe = new Stripe(secretKey, {
  apiVersion: "2026-05-27.dahlia",
});

/**
 * Base URL used to build Stripe success/cancel redirect URLs. Falls back to
 * localhost for local dev.
 */
export const appUrl = process.env.APP_URL ?? "http://localhost:3000";
