import Link from "next/link";

import { CategoryCard } from "@/components/category-card";
import { ProductCard } from "@/components/product-card";
import { getCategories } from "@/lib/queries/categories";
import { getProducts } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="py-12 sm:py-16">
        <h1 className="font-heading max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Everything for the perfect party, in one cart.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Balloons, banners, tableware, and confetti — curated decorations for
          birthdays, showers, and every celebration, shipped fast.
        </p>
      </section>

      {categories.length > 0 ? (
        <section className="pb-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Shop by category
            </h2>
            <Link
              href="/categories"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="pb-16">
        <h2 className="font-heading mb-6 text-xl font-semibold tracking-tight">
          New arrivals
        </h2>

        {products.length === 0 ? (
          <p className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            No products yet. Run{" "}
            <code className="font-mono text-sm">pnpm db:seed</code> to populate
            the catalog.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
