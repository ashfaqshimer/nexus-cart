import { beforeEach, describe, expect, it } from "vitest";

import {
  cartCount,
  cartSubtotal,
  useCartStore,
  type CartItem,
} from "@/lib/cart/store";

const product = (overrides: Partial<Omit<CartItem, "quantity">> = {}) => ({
  id: 1,
  slug: "balloon",
  name: "Balloon",
  price: 500,
  image: "",
  stock: 10,
  ...overrides,
});

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

const items = () => useCartStore.getState().items;

describe("addItem", () => {
  it("adds a new line item with the given quantity", () => {
    useCartStore.getState().addItem(product(), 2);

    expect(items()).toEqual([expect.objectContaining({ id: 1, quantity: 2 })]);
  });

  it("merges quantity into an existing line item", () => {
    const { addItem } = useCartStore.getState();
    addItem(product(), 2);
    addItem(product(), 3);

    expect(items()).toHaveLength(1);
    expect(items()[0].quantity).toBe(5);
  });

  it("caps quantity at available stock", () => {
    useCartStore.getState().addItem(product({ stock: 3 }), 10);

    expect(items()[0].quantity).toBe(3);
  });

  it("ignores out-of-stock products", () => {
    useCartStore.getState().addItem(product({ stock: 0 }), 1);

    expect(items()).toHaveLength(0);
  });
});

describe("setQuantity", () => {
  it("clamps to available stock", () => {
    const { addItem, setQuantity } = useCartStore.getState();
    addItem(product({ stock: 4 }), 1);
    setQuantity(1, 99);

    expect(items()[0].quantity).toBe(4);
  });

  it("removes the item when quantity drops to zero or below", () => {
    const { addItem, setQuantity } = useCartStore.getState();
    addItem(product(), 2);
    setQuantity(1, 0);

    expect(items()).toHaveLength(0);
  });
});

describe("removeItem / clear", () => {
  it("removes a single item by id", () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem(product({ id: 1 }), 1);
    addItem(product({ id: 2, slug: "streamer" }), 1);
    removeItem(1);

    expect(items()).toEqual([expect.objectContaining({ id: 2 })]);
  });

  it("clears all items", () => {
    const { addItem, clear } = useCartStore.getState();
    addItem(product(), 1);
    clear();

    expect(items()).toHaveLength(0);
  });
});

describe("derivations", () => {
  it("cartCount sums quantities", () => {
    const list: CartItem[] = [
      { ...product({ id: 1 }), quantity: 2 },
      { ...product({ id: 2 }), quantity: 3 },
    ];

    expect(cartCount(list)).toBe(5);
  });

  it("cartSubtotal sums price * quantity in cents", () => {
    const list: CartItem[] = [
      { ...product({ id: 1, price: 500 }), quantity: 2 },
      { ...product({ id: 2, price: 1299 }), quantity: 1 },
    ];

    expect(cartSubtotal(list)).toBe(500 * 2 + 1299);
  });
});
