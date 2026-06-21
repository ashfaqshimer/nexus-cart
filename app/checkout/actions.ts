"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";

import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";
import { getProductsByIds } from "@/lib/queries/products";
import { appUrl, stripe } from "@/lib/stripe";

/** A cart line item as sent from the client — only id + quantity are trusted. */
export type CheckoutLineItem = {
  id: number;
  quantity: number;
};

export type CheckoutState = {
  error?: string;
};

/**
 * Create a Stripe Checkout Session for the given cart and redirect the guest to
 * Stripe's hosted checkout page.
 *
 * The client sends only `{ id, quantity }`; price and stock are re-read from the
 * DB here so a tampered client can't change what's charged. A `pending` order
 * (with item snapshots) is persisted before the redirect so the webhook always
 * finds a row to mark `paid`.
 */
export async function createCheckoutSession(
  lineItems: CheckoutLineItem[],
  _prevState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (!name) {
    return { error: "Please enter your full name." };
  }

  // Normalize and de-dupe the requested items by id.
  const quantityById = new Map<number, number>();
  for (const item of lineItems) {
    const qty = Math.floor(item.quantity);
    if (!Number.isInteger(item.id) || qty <= 0) continue;
    quantityById.set(item.id, (quantityById.get(item.id) ?? 0) + qty);
  }

  if (quantityById.size === 0) {
    return { error: "Your cart is empty." };
  }

  const products = await getProductsByIds([...quantityById.keys()]);

  const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const orderItemRows: {
    productId: number;
    name: string;
    quantity: number;
    unitPrice: number;
  }[] = [];

  for (const [id, quantity] of quantityById) {
    const product = products.get(id);
    if (!product) {
      return { error: "One of the items in your cart is no longer available." };
    }
    if (product.stock <= 0 || quantity > product.stock) {
      return {
        error: `"${product.name}" doesn't have enough stock for your order.`,
      };
    }

    stripeLineItems.push({
      quantity,
      price_data: {
        currency: "usd",
        // Authoritative price in cents from the DB — never the client.
        unit_amount: product.price,
        product_data: { name: product.name },
      },
    });
    orderItemRows.push({
      productId: id,
      name: product.name,
      quantity,
      unitPrice: product.price,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: stripeLineItems,
    customer_email: email,
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU"],
    },
    success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/checkout?canceled=1`,
  });

  // Persist the pending order + items before redirecting, so the webhook always
  // has a row keyed by the session id to flip to "paid".
  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({ stripeSessionId: session.id, email, shippingName: name })
      .returning({ id: orders.id });

    await tx
      .insert(orderItems)
      .values(orderItemRows.map((row) => ({ ...row, orderId: order.id })));
  });

  if (!session.url) {
    return { error: "Could not start checkout. Please try again." };
  }

  // Must be called outside any try/catch — redirect() throws NEXT_REDIRECT.
  redirect(session.url);
}
