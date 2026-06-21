"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  useCartCount,
  useCartHydrated,
  useCartStore,
  useCartSubtotal,
  type CartItem,
} from "@/lib/cart/store";
import { formatPrice } from "@/lib/format";

/**
 * The cart trigger (header icon + count badge) and the sliding drawer it opens.
 * A single client component so "add to cart" elsewhere can open this via the
 * shared store's `isOpen` state.
 */
export function CartSheet() {
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const items = useCartStore((s) => s.items);
  const subtotal = useCartSubtotal();
  const count = useCartCount();
  const hydrated = useCartHydrated();

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open cart" />}
      >
        <span className="relative">
          <ShoppingCart />
          {hydrated && count > 0 ? (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-none text-primary-foreground tabular-nums">
              {count}
            </span>
          ) : null}
        </span>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Your cart</SheetTitle>
          <SheetDescription>
            {hydrated && count > 0
              ? `${count} item${count === 1 ? "" : "s"} in your cart`
              : "Review the items in your cart"}
          </SheetDescription>
        </SheetHeader>

        {hydrated && items.length > 0 ? (
          <>
            <ul className="flex-1 divide-y overflow-y-auto px-4">
              {items.map((item) => (
                <CartRow key={item.id} item={item} />
              ))}
            </ul>

            <SheetFooter className="border-t">
              <div className="flex items-center justify-between text-base font-medium">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <Button size="lg" disabled className="w-full">
                Checkout
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Checkout coming soon.
              </p>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <ShoppingCart className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button
              variant="outline"
              render={<Link href="/" />}
              onClick={() => setOpen(false)}
            >
              Browse products
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const setOpen = useCartStore((s) => s.setOpen);

  return (
    <li className="flex gap-3 py-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.slug}`}
            onClick={() => setOpen(false)}
            className="line-clamp-2 text-sm font-medium hover:underline"
          >
            {item.name}
          </Link>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Remove ${item.name}`}
            onClick={() => removeItem(item.id)}
          >
            <Trash2 />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-lg border">
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Decrease quantity"
              disabled={item.quantity <= 1}
              onClick={() => setQuantity(item.id, item.quantity - 1)}
            >
              <Minus />
            </Button>
            <span className="w-8 text-center text-sm tabular-nums">
              {item.quantity}
            </span>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Increase quantity"
              disabled={item.quantity >= item.stock}
              onClick={() => setQuantity(item.id, item.quantity + 1)}
            >
              <Plus />
            </Button>
          </div>
          <span className="text-sm font-semibold tabular-nums">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </li>
  );
}
