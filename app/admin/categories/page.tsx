import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { DeleteCategoryButton } from "@/components/admin/delete-category-button";
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
import { getAllCategoriesForAdmin } from "@/lib/queries/categories";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function AdminCategoriesPage() {
  // Defense in depth — the layout already gates, but actions/pages re-check.
  await requireAdmin();

  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Categories
        </h1>
        <Link
          href="/admin/categories/new"
          className={buttonVariants({ variant: "default" })}
        >
          <Plus className="size-4" />
          Add category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No categories yet. Add your first category to get started.
        </p>
      ) : (
        <div className="mt-6 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.slug}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {category.productCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        aria-label={`Edit ${category.name}`}
                        render={
                          <Link
                            href={`/admin/categories/${category.id}/edit`}
                          />
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <DeleteCategoryButton
                        id={category.id}
                        name={category.name}
                        productCount={category.productCount}
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
