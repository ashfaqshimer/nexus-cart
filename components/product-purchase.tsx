"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/lib/cart/store";

type ProductPurchaseProps = Omit<CartItem, "quantity">;

/**
 * Purchase controls for the product detail page: a quantity stepper and an
 * add-to-cart button wired to the client cart store.
 */
export function ProductPurchase({ stock, ...product }: ProductPurchaseProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [quantity, setQuantity] = useState(1);

  const outOfStock = stock <= 0;

  if (outOfStock) {
    return (
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          variant="secondary"
          disabled
          className="w-full sm:w-auto"
        >
          Out of stock
        </Button>
        <p className="text-sm text-muted-foreground">
          This item is currently unavailable.
        </p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({ ...product, stock }, quantity);
    openCart();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-lg border">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Minus />
          </Button>
          <span className="w-8 text-center text-sm tabular-nums">
            {quantity}
          </span>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Increase quantity"
            disabled={quantity >= stock}
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          >
            <Plus />
          </Button>
        </div>
        <Button
          size="lg"
          className="flex-1 sm:flex-none"
          onClick={handleAddToCart}
        >
          <ShoppingCart />
          Add to cart
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{stock} in stock</p>
    </div>
  );
}
