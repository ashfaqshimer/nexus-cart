import { asc, count, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { isUniqueViolation, slugWithSuffix } from "@/lib/slug";
import type { CategoryInput } from "@/lib/validation/admin";

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

// ---------------------------------------------------------------------------
// Admin CRUD
// ---------------------------------------------------------------------------

// Cap on slug-collision retries before giving up (see slugWithSuffix).
const MAX_SLUG_ATTEMPTS = 50;

/**
 * All categories for the admin list table, alphabetical, each with its product
 * count (drives the list display and the delete-confirmation warning). Shares
 * the {@link getCategories} shape; kept separate so admin-only filtering can
 * diverge later without touching the storefront.
 */
export async function getAllCategoriesForAdmin(): Promise<CategoryListItem[]> {
  return getCategories();
}

/**
 * Fetch a single category by id for the edit form. Returns null when none
 * matches.
 */
export async function getCategoryById(id: number): Promise<Category | null> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Insert a category. `input.slug` is the already-normalized base slug; on a
 * unique-slug collision we retry with `-2`, `-3`, … until one sticks.
 */
export async function createCategory(input: CategoryInput): Promise<Category> {
  const { slug, ...rest } = input;

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
    try {
      const [row] = await db
        .insert(categories)
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
 * Update a category by id, using the same slug-collision retry as create.
 * Re-using the row's own current slug is fine (no self-collision). Returns null
 * when no category matches the id.
 */
export async function updateCategory(
  id: number,
  input: CategoryInput,
): Promise<Category | null> {
  const { slug, ...rest } = input;

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
    try {
      const [row] = await db
        .update(categories)
        .set({ ...rest, slug: slugWithSuffix(slug, attempt) })
        .where(eq(categories.id, id))
        .returning();
      return row ?? null;
    } catch (error) {
      if (isUniqueViolation(error)) continue;
      throw error;
    }
  }

  throw new Error(`Could not generate a unique slug for "${input.name}"`);
}

/**
 * Delete a category by id. Products in the category are not deleted — the FK is
 * `on delete set null`, so their `categoryId` becomes null.
 */
export async function deleteCategory(id: number): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}
