import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/db/schema";

export type OrderSummary = {
  id: number;
  email: string;
  status: string;
  amountTotal: number | null;
  currency: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
  }[];
};

/**
 * Fetch an order (with its line items) by Stripe Checkout Session id, for the
 * order-confirmation page. Returns null when no order matches.
 */
export async function getOrderBySessionId(
  sessionId: string,
): Promise<OrderSummary | null> {
  const [order] = await db
    .select({
      id: orders.id,
      email: orders.email,
      status: orders.status,
      amountTotal: orders.amountTotal,
      currency: orders.currency,
    })
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      name: orderItems.name,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id))
    .orderBy(asc(orderItems.id));

  return { ...order, items };
}
