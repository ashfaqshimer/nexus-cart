import type { Metadata } from "next";

import { createProductAction } from "@/app/admin/products/actions";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth-dal";
import { getCategories } from "@/lib/queries/categories";

export const metadata: Metadata = {
  title: "New product",
};

export default async function NewProductPage() {
  await requireAdmin();

  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        New product
      </h1>
      <div className="mt-6">
        <ProductForm
          action={createProductAction}
          categories={categories}
          submitLabel="Create product"
        />
      </div>
    </div>
  );
}
