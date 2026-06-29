import type { Metadata } from "next";

import { createCategoryAction } from "@/app/admin/categories/actions";
import { CategoryForm } from "@/components/admin/category-form";
import { requireAdmin } from "@/lib/auth-dal";

export const metadata: Metadata = {
  title: "New category",
};

export default async function NewCategoryPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        New category
      </h1>
      <div className="mt-6">
        <CategoryForm
          action={createCategoryAction}
          submitLabel="Create category"
        />
      </div>
    </div>
  );
}
