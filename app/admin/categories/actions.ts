"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth-dal";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/queries/categories";
import { categoryInput } from "@/lib/validation/admin";

export type CategoryActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

/** Coerce a FormData entry to a string (files / nulls become ""). */
function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

/** Validate the category form payload. */
function parseCategoryForm(formData: FormData) {
  return categoryInput.safeParse({
    name: asString(formData.get("name")),
    slug: asString(formData.get("slug")),
    description: asString(formData.get("description")),
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
 * Refresh every storefront surface a category edit can touch: the admin list,
 * the homepage grid + header nav (rendered in the root layout), the /categories
 * index, and the dynamic category pages (an explicit 'page' type revalidates the
 * whole dynamic segment).
 */
function revalidateCategories() {
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/categories/[slug]", "page");
}

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return {
      fieldErrors: firstFieldErrors(z.flattenError(parsed.error).fieldErrors),
    };
  }

  try {
    await createCategory(parsed.data);
  } catch {
    return { error: "Could not save the category. Please try again." };
  }

  revalidateCategories();
  // Outside try/catch — redirect() throws NEXT_REDIRECT.
  redirect("/admin/categories");
}

export async function updateCategoryAction(
  id: number,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return {
      fieldErrors: firstFieldErrors(z.flattenError(parsed.error).fieldErrors),
    };
  }

  try {
    const updated = await updateCategory(id, parsed.data);
    if (!updated) {
      return { error: "That category no longer exists." };
    }
  } catch {
    return { error: "Could not save the category. Please try again." };
  }

  revalidateCategories();
  redirect("/admin/categories");
}

export async function deleteCategoryAction(id: number) {
  await requireAdmin();

  await deleteCategory(id);

  revalidateCategories();
  redirect("/admin/categories");
}
