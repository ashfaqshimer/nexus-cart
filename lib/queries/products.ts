import { and, desc, eq, ne } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";

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
 * Fetch products for the catalog grid, newest first, with their category name.
 */
export async function getProducts(): Promise<ProductListItem[]> {
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      images: products.images,
      stock: products.stock,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
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
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      images: products.images,
      stock: products.stock,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.categoryId, categoryId), ne(products.id, excludeId)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

/**
 * Format a price stored in integer cents as a localized currency string.
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
