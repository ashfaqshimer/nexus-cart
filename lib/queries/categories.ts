import { asc, count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";

export type Category = typeof categories.$inferSelect;

export type CategoryListItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
};

/**
 * Fetch all categories alphabetically, each with the number of products it
 * contains. Used by the header nav, the homepage "shop by category" section,
 * and the /categories index. Categories with no products report a count of 0.
 */
export async function getCategories(): Promise<CategoryListItem[]> {
  return db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}

/**
 * Fetch a single category by its unique slug. Returns null when none matches.
 */
export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}
