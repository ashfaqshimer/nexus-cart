/**
 * URL-slug helpers shared by the admin CRUD layer. Pure functions (no DB) so
 * they can be unit-tested directly; the unique-slug retry loop lives in the
 * query layer (see lib/queries/products.ts) and uses `isUniqueViolation`.
 */

// Combining diacritical marks (U+0300–U+036F), left over after NFKD normalize.
const DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

/**
 * Convert an arbitrary string into a URL-safe slug: lowercase ASCII words
 * joined by single dashes, with diacritics stripped and no leading/trailing
 * dashes. Returns an empty string when nothing slug-able remains.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The slug to try on the Nth attempt at making it unique. Attempt 1 returns the
 * base unchanged; later attempts append `-2`, `-3`, … so the first collision
 * becomes `slug-2`.
 */
export function slugWithSuffix(base: string, attempt: number): string {
  return attempt <= 1 ? base : `${base}-${attempt}`;
}

/**
 * True when an error thrown by a write is a Postgres unique-constraint
 * violation (SQLSTATE 23505). Used to retry slug generation on collision.
 */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}
