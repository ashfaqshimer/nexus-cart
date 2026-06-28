import { and, asc, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { isUniqueViolation, slugWithSuffix } from "@/lib/slug";
import type { ProductInput } from "@/lib/validation/admin";

// Re-exported from a DB-free module so client components can import it without
// pulling the server-only db client into the browser bundle.
export { formatPrice } from "@/lib/format";

export type ProductListItem = {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  categoryName: string | null;
};

export type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  stock: number;
  categoryId: number | null;
  categoryName: string | null;
};

/**
 * How a product listing can be ordered. Drives the category-page sort control.
 */
export type ProductSort = "newest" | "price-asc" | "price-desc";

/**
 * Coerce an untrusted query-string value (e.g. `?sort=`) into a valid
 * ProductSort, falling back to "newest".
 */
export function parseProductSort(value: string | undefined): ProductSort {
  return value === "price-asc" || value === "price-desc" || value === "newest"
    ? value
    : "newest";
}

function orderByForSort(sort: ProductSort) {
  switch (sort) {
    case "price-asc":
      return asc(products.price);
    case "price-desc":
      return desc(products.price);
    default:
      return desc(products.createdAt);
  }
}

// Shared column selection for the product-list shape (ProductListItem). Joined
// against `categories` so it must be used with a leftJoin on the category.
const productListColumns = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  price: products.price,
  images: products.images,
  stock: products.stock,
  categoryName: categories.name,
};

/**
 * Fetch products for the catalog grid, newest first, with their category name.
 */
export async function getProducts(): Promise<ProductListItem[]> {
  return db
    .select(productListColumns)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
}

/**
 * Fetch the products in a category, ordered by the given sort. Used by the
 * /categories/[slug] page.
 */
export async function getProductsByCategory(
  categoryId: number,
  sort: ProductSort = "newest",
): Promise<ProductListItem[]> {
  return db
    .select(productListColumns)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.categoryId, categoryId))
    .orderBy(orderByForSort(sort));
}

/**
 * Escape the characters that are special in a SQL LIKE/ILIKE pattern (`\`, `%`,
 * `_`) so user input is matched literally rather than as wildcards.
 */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Full-text-ish product search: case-insensitive substring match against the
 * product name and description, ordered by the given sort. Used by the header
 * typeahead (with a small `limit`) and the /search results page. Returns an
 * empty array for a blank query rather than matching every product.
 */
export async function searchProducts(
  query: string,
  sort: ProductSort = "newest",
  limit?: number,
): Promise<ProductListItem[]> {
  const trimmed = query.trim();
  if (trimmed === "") return [];

  const pattern = `%${escapeLike(trimmed)}%`;

  const builder = db
    .select(productListColumns)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(
      or(ilike(products.name, pattern), ilike(products.description, pattern)),
    )
    .orderBy(orderByForSort(sort));

  return limit === undefined ? builder : builder.limit(limit);
}

/**
 * Fetch a single product by its unique slug, with its category name.
 * Returns null when no product matches.
 */
export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      images: products.images,
      stock: products.stock,
      categoryId: products.categoryId,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

export type CheckoutProduct = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

/**
 * Fetch the authoritative name/price/stock for a set of product ids. Used at
 * checkout to re-price the cart from the DB rather than trusting client-sent
 * prices. Returns a Map keyed by product id; ids with no matching product are
 * simply absent from the map.
 */
export async function getProductsByIds(
  ids: number[],
): Promise<Map<number, CheckoutProduct>> {
  if (ids.length === 0) return new Map();

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      stock: products.stock,
    })
    .from(products)
    .where(inArray(products.id, ids));

  return new Map(rows.map((row) => [row.id, row]));
}

/**
 * Fetch other products in the same category, newest first, excluding the
 * given product.
 */
export async function getRelatedProducts(
  categoryId: number,
  excludeId: number,
  limit = 4,
): Promise<ProductListItem[]> {
  return db
    .select(productListColumns)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.categoryId, categoryId), ne(products.id, excludeId)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

// ---------------------------------------------------------------------------
// Admin CRUD
// ---------------------------------------------------------------------------

/** A full product row, as needed to prefill the admin edit form. */
export type AdminProduct = typeof products.$inferSelect;

// Cap on slug-collision retries before giving up (see slugWithSuffix).
const MAX_SLUG_ATTEMPTS = 50;

/**
 * All products for the admin list table, newest first, with category names.
 * Distinct from `getProducts` (the public grid) so admin-only filtering can
 * diverge later without touching the storefront.
 */
export async function getAllProductsForAdmin(): Promise<ProductListItem[]> {
  return db
    .select(productListColumns)
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
}

/**
 * Fetch a single product by id (all columns) for the edit form. Returns null
 * when no product matches.
 */
export async function getProductById(id: number): Promise<AdminProduct | null> {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Insert a product. `input.slug` is the already-normalized base slug; on a
 * unique-slug collision we retry with `-2`, `-3`, … until one sticks.
 */
export async function createProduct(
  input: ProductInput,
): Promise<AdminProduct> {
  const { slug, ...rest } = input;

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
    try {
      const [row] = await db
        .insert(products)
        .values({ ...rest, slug: slugWithSuffix(slug, attempt) })
        .returning();
      return row;
    } catch (error) {
      if (isUniqueViolation(error)) continue;
      throw error;
    }
  }

  throw new Error(`Could not generate a unique slug for "${input.name}"`);
}

/**
 * Update a product by id, using the same slug-collision retry as create.
 * Re-using the row's own current slug is fine (no self-collision). Returns null
 * when no product matches the id.
 */
export async function updateProduct(
  id: number,
  input: ProductInput,
): Promise<AdminProduct | null> {
  const { slug, ...rest } = input;

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
    try {
      const [row] = await db
        .update(products)
        .set({ ...rest, slug: slugWithSuffix(slug, attempt) })
        .where(eq(products.id, id))
        .returning();
      return row ?? null;
    } catch (error) {
      if (isUniqueViolation(error)) continue;
      throw error;
    }
  }

  throw new Error(`Could not generate a unique slug for "${input.name}"`);
}

/** Delete a product by id. */
export async function deleteProduct(id: number): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
}
