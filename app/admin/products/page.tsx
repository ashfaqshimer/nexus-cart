import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth-dal";
import { formatPrice, getAllProductsForAdmin } from "@/lib/queries/products";

export const metadata: Metadata = {
  title: "Products",
};

export default async function AdminProductsPage() {
  // Defense in depth — the layout already gates, but actions/pages re-check.
  await requireAdmin();

  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Products
        </h1>
        <Link
          href="/admin/products/new"
          className={buttonVariants({ variant: "default" })}
        >
          <Plus className="size-4" />
          Add product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No products yet. Add your first product to get started.
        </p>
      ) : (
        <div className="mt-6 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Images</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="tabular-nums">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {product.stock}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.categoryName ?? "—"}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {product.images.length}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        aria-label={`Edit ${product.name}`}
                        render={
                          <Link href={`/admin/products/${product.id}/edit`} />
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <DeleteProductButton
                        id={product.id}
                        name={product.name}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
