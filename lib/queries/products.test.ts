import { beforeEach, describe, expect, it, vi } from "vitest";

// `lib/db/index.ts` throws when DATABASE_URL is unset and opens a postgres
// connection at import time, so the whole module is mocked. The query
// functions use drizzle's chainable, awaitable builder; `builder` mimics that
// chain and resolves (via `then`) to a per-test configurable `rows` array.
const { builder, setRows } = vi.hoisted(() => {
  let rows: unknown[] = [];
  const b: Record<string, unknown> = {};
  for (const method of [
    "select",
    "from",
    "leftJoin",
    "where",
    "orderBy",
    "limit",
  ]) {
    b[method] = vi.fn(() => b);
  }
  b.then = (
    resolve: (value: unknown) => unknown,
    reject: (reason: unknown) => unknown,
  ) => Promise.resolve(rows).then(resolve, reject);
  return {
    builder: b as Record<string, ReturnType<typeof vi.fn>> &
      PromiseLike<unknown>,
    setRows: (r: unknown[]) => {
      rows = r;
    },
  };
});

vi.mock("@/lib/db", () => ({ db: builder }));

import {
  formatPrice,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/queries/products";

beforeEach(() => {
  setRows([]);
  vi.clearAllMocks();
});

describe("getProducts", () => {
  it("returns the rows the query resolves to", async () => {
    const fixture = [
      {
        id: 1,
        name: "Balloon",
        slug: "balloon",
        price: 500,
        images: [],
        stock: 3,
        categoryName: "Balloons",
      },
    ];
    setRows(fixture);

    await expect(getProducts()).resolves.toEqual(fixture);
  });

  it("returns an empty array when there are no products", async () => {
    await expect(getProducts()).resolves.toEqual([]);
  });
});

describe("getProductBySlug", () => {
  it("returns the single matching product", async () => {
    const product = {
      id: 1,
      name: "Balloon",
      slug: "balloon",
      description: "A balloon",
      price: 500,
      images: [],
      stock: 3,
      categoryId: 2,
      categoryName: "Balloons",
    };
    setRows([product]);

    await expect(getProductBySlug("balloon")).resolves.toEqual(product);
  });

  it("returns null when no product matches", async () => {
    setRows([]);

    await expect(getProductBySlug("missing")).resolves.toBeNull();
  });
});

describe("getRelatedProducts", () => {
  it("defaults the limit to 4", async () => {
    await getRelatedProducts(2, 1);

    expect(builder.limit).toHaveBeenCalledWith(4);
  });

  it("respects an explicit limit", async () => {
    await getRelatedProducts(2, 1, 8);

    expect(builder.limit).toHaveBeenCalledWith(8);
  });

  it("returns the rows the query resolves to", async () => {
    const fixture = [
      {
        id: 2,
        name: "Streamer",
        slug: "streamer",
        price: 300,
        images: [],
        stock: 5,
        categoryName: "Balloons",
      },
    ];
    setRows(fixture);

    await expect(getRelatedProducts(2, 1)).resolves.toEqual(fixture);
  });
});

describe("formatPrice", () => {
  it("formats whole dollars", () => {
    expect(formatPrice(0)).toBe("$0.00");
    expect(formatPrice(500)).toBe("$5.00");
  });

  it("formats cents", () => {
    expect(formatPrice(1999)).toBe("$19.99");
  });

  it("adds thousands separators", () => {
    expect(formatPrice(1234567)).toBe("$12,345.67");
  });
});
