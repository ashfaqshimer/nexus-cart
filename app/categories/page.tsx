import type { Metadata } from "next";
import Link from "next/link";

import { CategoryCard } from "@/components/category-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getCategories } from "@/lib/queries/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop by category",
  description:
    "Browse NexusCart party decorations by category — balloons, banners, tableware, confetti, and more.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/">Home</Link>} />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Categories</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <section className="mt-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Shop by category
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Find everything for your celebration, organized by what it&apos;s for.
        </p>
      </section>

      {categories.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No categories yet. Run{" "}
          <code className="font-mono text-sm">pnpm db:seed</code> to populate
          the catalog.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
