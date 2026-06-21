import { Minus, Plus, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Purchase controls for the product detail page. The cart is a later phase, so
 * the quantity stepper and add-to-cart button are non-functional placeholders
 * ready to be wired up once the cart exists.
 */
export function ProductPurchase({ stock }: { stock: number }) {
  const outOfStock = stock <= 0;

  if (outOfStock) {
    return (
      <div className="flex flex-col gap-2">
        <Button size="lg" variant="secondary" disabled className="w-full sm:w-auto">
          Out of stock
        </Button>
        <p className="text-sm text-muted-foreground">
          This item is currently unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-lg border">
          <Button size="icon" variant="ghost" disabled aria-label="Decrease quantity">
            <Minus />
          </Button>
          <span className="w-8 text-center text-sm tabular-nums">1</span>
          <Button size="icon" variant="ghost" disabled aria-label="Increase quantity">
            <Plus />
          </Button>
        </div>
        <Button size="lg" disabled className="flex-1 sm:flex-none">
          <ShoppingCart />
          Add to cart
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {stock} in stock · checkout coming soon
      </p>
    </div>
  );
}
