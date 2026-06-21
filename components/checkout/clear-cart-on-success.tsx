"use client";

import { useEffect } from "react";

import { useCartStore } from "@/lib/cart/store";

/**
 * Clears the persisted cart once, on mount. Rendered only on the order-success
 * page so the cart survives a canceled or abandoned checkout and is emptied only
 * after a real, confirmed order.
 */
export function ClearCartOnSuccess() {
  useEffect(() => {
    useCartStore.getState().clear();
  }, []);

  return null;
}
