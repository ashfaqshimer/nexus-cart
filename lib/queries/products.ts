import { desc, eq } from "drizzle-orm";

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
 * Format a price stored in integer cents as a localized currency string.
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
