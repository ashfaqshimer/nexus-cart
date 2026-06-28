import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateProductAction } from "@/app/admin/products/actions";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/auth-dal";
import { getCategories } from "@/lib/queries/categories";
import { getProductById } from "@/lib/queries/products";

export const metadata: Metadata = {
  title: "Edit product",
};

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireAdmin();

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const [product, categories] = await Promise.all([
    getProductById(productId),
    getCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Edit product
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{product.name}</p>
      <div className="mt-6">
        <ProductForm
          action={updateProductAction.bind(null, product.id)}
          categories={categories}
          product={product}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
