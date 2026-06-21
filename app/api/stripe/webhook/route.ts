import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe webhook receiver. Stripe POSTs the raw request body plus a signature
 * header; we verify the signature against the raw text (never a parsed body) and
 * mark the matching order paid. Route Handlers in this Next.js version expose the
 * raw body via `request.text()` — no bodyParser config needed.
 *
 * Keep the default Node.js runtime: Stripe's signature verification needs Node
 * crypto and is not available on the edge runtime.
 */
export async function POST(request: Request) {
  if (!webhookSecret) {
    return new Response("STRIPE_WEBHOOK_SECRET is not set", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      await markOrderPaid(event.data.object);
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      await markOrderFailed(event.data.object.id);
      break;
    }
    default:
      break;
  }

  return new Response("ok", { status: 200 });
}

async function markOrderPaid(session: Stripe.Checkout.Session) {
  const shipping = session.collected_information?.shipping_details;
  const address = shipping?.address;

  // Idempotent: the WHERE guards against re-processing a session already paid
  // (Stripe may deliver the same event more than once).
  await db
    .update(orders)
    .set({
      status: "paid",
      amountTotal: session.amount_total,
      currency: session.currency ?? "usd",
      shippingName: shipping?.name ?? null,
      shippingLine1: address?.line1 ?? null,
      shippingLine2: address?.line2 ?? null,
      shippingCity: address?.city ?? null,
      shippingState: address?.state ?? null,
      shippingPostalCode: address?.postal_code ?? null,
      shippingCountry: address?.country ?? null,
    })
    .where(eq(orders.stripeSessionId, session.id));
}

async function markOrderFailed(sessionId: string) {
  // Only fail orders still pending — never clobber one already paid.
  await db
    .update(orders)
    .set({ status: "failed" })
    .where(
      and(eq(orders.stripeSessionId, sessionId), eq(orders.status, "pending")),
    );
}
