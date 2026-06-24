import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { ProductSort } from "@/components/product-sort";
import { parseProductSort, searchProducts } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const query = (await searchParams).q?.trim();

  return {
    title: query ? `Search results for “${query}”` : "Search",
    description: query
      ? `Products matching “${query}” at NexusCart.`
      : "Search the NexusCart catalog.",
    // Search result pages are thin and effectively unbounded — keep them out of
    // the index even though the rest of the site is indexed.
    robots: { index: false },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q, sort: sortParam } = await searchParams;
  const query = q?.trim() ?? "";
  const sort = parseProductSort(sortParam);

  const products = query ? await searchProducts(query, sort) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {query ? <>Results for &ldquo;{query}&rdquo;</> : "Search"}
        </h1>
      </section>

      {query === "" ? (
        <p className="mt-10 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          Type a product name in the search box to get started.
        </p>
      ) : products.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No products match &ldquo;{query}&rdquo;. Try a different search.
        </p>
      ) : (
        <>
          <div className="mt-8 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
            <ProductSort
              basePath="/search"
              active={sort}
              params={{ q: query }}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
