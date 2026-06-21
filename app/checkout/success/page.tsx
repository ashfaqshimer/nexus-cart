import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

import { ClearCartOnSuccess } from "@/components/checkout/clear-cart-on-success";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { getOrderBySessionId } from "@/lib/queries/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { session_id: sessionId } = await searchParams;
  const order = sessionId ? await getOrderBySessionId(sessionId) : null;

  // The webhook may not have landed yet — treat anything not-yet-paid as
  // "processing" rather than an error.
  const isPaid = order?.status === "paid";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      {/* Clear the cart now that the order exists. */}
      <ClearCartOnSuccess />

      {isPaid ? (
        <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
      ) : (
        <Clock className="mx-auto size-12 text-muted-foreground" />
      )}

      <h1 className="font-heading mt-4 text-3xl font-semibold tracking-tight">
        {isPaid ? "Thank you for your order!" : "Order received"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {isPaid
          ? `A confirmation has been sent to ${order?.email}.`
          : "We're confirming your payment — this only takes a moment. A confirmation email will follow."}
      </p>

      {order ? (
        <div className="mx-auto mt-8 max-w-md rounded-lg border p-5 text-left">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Order #{order.id}</span>
            <span className="capitalize">{order.status}</span>
          </div>
          <ul className="mt-4 divide-y">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 py-3 text-sm"
              >
                <span className="min-w-0">
                  <span className="line-clamp-2">{item.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    × {item.quantity}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {order.amountTotal != null ? (
            <div className="mt-4 flex items-center justify-between border-t pt-4 text-base font-medium">
              <span>Total</span>
              <span className="tabular-nums">
                {formatPrice(order.amountTotal)}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button className="mt-8" nativeButton={false} render={<Link href="/" />}>
        Continue shopping
      </Button>
    </div>
  );
}
