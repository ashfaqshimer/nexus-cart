"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth-dal";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/queries/products";
import { productInput } from "@/lib/validation/admin";

export type ProductActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** Coerce a FormData entry to a string (files / nulls become ""). */
function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

/** Validate the product form payload, reading repeated image URLs via getAll. */
function parseProductForm(formData: FormData) {
  return productInput.safeParse({
    name: asString(formData.get("name")),
    slug: asString(formData.get("slug")),
    description: asString(formData.get("description")),
    price: asString(formData.get("price")),
    stock: asString(formData.get("stock")),
    categoryId: asString(formData.get("categoryId")),
    images: formData
      .getAll("images")
      .filter((v): v is string => typeof v === "string"),
  });
}

/** Reduce zod's per-field error arrays to the first message per field. */
function firstFieldErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) out[field] = messages[0];
  }
  return out;
}

/**
 * Refresh every storefront surface a catalog edit can touch: the admin list,
 * the homepage grid, and the dynamic product/category pages (which need an
 * explicit 'page' type to revalidate the whole dynamic segment).
 */
function revalidateStorefront() {
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/categories");
  revalidatePath("/categories/[slug]", "page");
}

export async function createProductAction(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return {
      fieldErrors: firstFieldErrors(z.flattenError(parsed.error).fieldErrors),
    };
  }

  try {
    await createProduct(parsed.data);
  } catch {
    return { error: "Could not save the product. Please try again." };
  }

  revalidateStorefront();
  // Outside try/catch — redirect() throws NEXT_REDIRECT.
  redirect("/admin/products");
}

export async function updateProductAction(
  id: number,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return {
      fieldErrors: firstFieldErrors(z.flattenError(parsed.error).fieldErrors),
    };
  }

  try {
    const updated = await updateProduct(id, parsed.data);
    if (!updated) {
      return { error: "That product no longer exists." };
    }
  } catch {
    return { error: "Could not save the product. Please try again." };
  }

  revalidateStorefront();
  redirect("/admin/products");
}

export async function deleteProductAction(id: number) {
  await requireAdmin();

  await deleteProduct(id);

  revalidateStorefront();
  redirect("/admin/products");
}
