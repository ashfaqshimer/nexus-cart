"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ShoppingCart } from "lucide-react";

import {
  createCheckoutSession,
  type CheckoutState,
} from "@/app/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCartHydrated,
  useCartStore,
  useCartSubtotal,
} from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";

const initialState: CheckoutState = {};

export function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartSubtotal();
  const hydrated = useCartHydrated();
  const canceled = useSearchParams().get("canceled");

  // Bind the cart contents (id + quantity only) to the server action; the
  // server re-prices from the DB.
  const lineItems = items.map((i) => ({ id: i.id, quantity: i.quantity }));
  const [state, formAction] = useActionState(
    createCheckoutSession.bind(null, lineItems),
    initialState,
  );

  // Avoid a hydration flash: render nothing decisive until the cart rehydrates.
  if (!hydrated) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ShoppingCart className="size-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Browse products
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <form action={formAction} className="flex flex-col gap-5">
        {canceled ? (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Checkout canceled — your cart is still here.
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <p className="text-sm text-muted-foreground">
          You&apos;ll enter your shipping address and card details securely on
          the next step.
        </p>

        {state.error ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}

        <SubmitButton />
      </form>

      <aside className="h-fit rounded-lg border p-5">
        <h2 className="text-base font-medium">Order summary</h2>
        <ul className="mt-4 divide-y">
          {items.map((item) => (
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
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t pt-4 text-base font-medium">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatPrice(subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Redirecting to payment…" : "Proceed to payment"}
    </Button>
  );
}
