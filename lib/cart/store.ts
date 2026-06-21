import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * A single line item in the cart. We store a snapshot of the product (name,
 * price, image, stock) so the cart drawer renders without any DB round-trip.
 * Prices/stock may go stale until the item is re-added — acceptable for the
 * client-side MVP cart.
 *
 * `price` is in integer cents, consistent with the rest of the app. Format for
 * display with `formatPrice` from `lib/queries/products.ts`.
 */
export type CartItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  /** Whether the cart drawer is open. UI-only; never persisted. */
  isOpen: boolean;

  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQuantity: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
  clear: () => void;

  openCart: () => void;
  closeCart: () => void;
  setOpen: (open: boolean) => void;
};

const clampQuantity = (qty: number, stock: number) =>
  Math.max(1, Math.min(qty, Math.max(stock, 1)));

/**
 * The single source of truth for the cart. All cart logic lives here (not in
 * components) so a future migration to a server/Redis-backed cart only has to
 * swap this store's internals.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item, qty = 1) =>
        set((state) => {
          if (item.stock <= 0) return state;
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      ...item,
                      quantity: clampQuantity(i.quantity + qty, item.stock),
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: clampQuantity(qty, item.stock) },
            ],
          };
        }),

      setQuantity: (id, qty) =>
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: clampQuantity(qty, i.stock) } : i,
            ),
          };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clear: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setOpen: (open) => set({ isOpen: open }),
    }),
    {
      name: "nexus-cart",
      // Persist only the items — never the transient drawer open state.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Total number of units across all line items. */
export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);

/** Subtotal in integer cents. Display with `formatPrice`. */
export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/** Total number of units across all line items. */
export const useCartCount = () =>
  useCartStore((state) => cartCount(state.items));

/** Subtotal in integer cents. Display with `formatPrice`. */
export const useCartSubtotal = () =>
  useCartStore((state) => cartSubtotal(state.items));

/**
 * True once the persisted cart has rehydrated from localStorage on the client.
 * Server-rendered components (e.g. the header badge) should gate cart-derived
 * values on this to avoid hydration mismatches.
 */
export function useCartHydrated() {
  return useSyncExternalStore(
    (onChange) => useCartStore.persist.onFinishHydration(onChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}
