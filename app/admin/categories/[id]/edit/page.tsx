import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateCategoryAction } from "@/app/admin/categories/actions";
import { CategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/auth-dal";
import { getCategoryById } from "@/lib/queries/categories";

export const metadata: Metadata = {
  title: "Edit category",
};

type EditCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  await requireAdmin();

  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId) || categoryId <= 0) notFound();

  const category = await getCategoryById(categoryId);
  if (!category) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Edit category
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{category.name}</p>
      <div className="mt-6">
        <CategoryForm
          action={updateCategoryAction.bind(null, category.id)}
          category={category}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
