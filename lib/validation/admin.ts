import { z } from "zod";

import { slugify } from "@/lib/slug";

/**
 * Validation for the admin product form. Inputs arrive as `FormData` strings, so
 * fields are coerced: `price` is entered in **dollars** and transformed to the
 * integer **cents** the DB stores; `categoryId` collapses ""/"none" to null; and
 * `images` is the list of URLs collected via `formData.getAll("images")`.
 *
 * Field-level error paths are preserved, so `z.flattenError(err).fieldErrors`
 * maps cleanly onto the form inputs.
 */

const priceField = z.preprocess(
  (v) => {
    if (typeof v !== "string") return v;
    const trimmed = v.trim();
    return trimmed === "" ? undefined : trimmed;
  },
  z.coerce
    .number()
    .refine((n) => Number.isFinite(n), "Enter a valid price in dollars")
    .refine((n) => n >= 0, "Price cannot be negative"),
);

const stockField = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : v),
  z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
);

const categoryIdField = z.preprocess(
  (v) => (v === "" || v === "none" || v == null ? null : v),
  z.coerce.number().int().positive().nullable(),
);

export const productInput = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
    price: priceField,
    stock: stockField,
    categoryId: categoryIdField,
    images: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    const base = data.slug ? slugify(data.slug) : slugify(data.name);
    if (!base) {
      ctx.addIssue({
        code: "custom",
        message: "Name must contain at least one letter or number",
        path: ["name"],
      });
    }
  })
  .transform((data) => {
    const base = data.slug ? slugify(data.slug) : "";
    return {
      name: data.name,
      slug: base || slugify(data.name),
      description: data.description ? data.description : null,
      // Stored as integer cents to avoid floating-point money bugs.
      price: Math.round(data.price * 100),
      stock: data.stock,
      categoryId: data.categoryId,
      images: data.images.map((url) => url.trim()).filter(Boolean),
    };
  });

/** The normalized product shape the query layer persists. */
export type ProductInput = z.infer<typeof productInput>;

/**
 * Validation for the admin category form. Like {@link productInput} but with only
 * name/slug/description: `slug` is derived from the name when blank, and a blank
 * `description` collapses to null.
 */
export const categoryInput = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    slug: z.string().trim().optional(),
    description: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    const base = data.slug ? slugify(data.slug) : slugify(data.name);
    if (!base) {
      ctx.addIssue({
        code: "custom",
        message: "Name must contain at least one letter or number",
        path: ["name"],
      });
    }
  })
  .transform((data) => {
    const base = data.slug ? slugify(data.slug) : "";
    return {
      name: data.name,
      slug: base || slugify(data.name),
      description: data.description ? data.description : null,
    };
  });

/** The normalized category shape the query layer persists. */
export type CategoryInput = z.infer<typeof categoryInput>;
