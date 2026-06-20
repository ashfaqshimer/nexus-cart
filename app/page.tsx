import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/queries/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="py-12 sm:py-16">
        <h1 className="font-heading max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Everything you need, in one cart.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Discover a curated selection of electronics, apparel, and home goods —
          shipped fast and priced fair.
        </p>
      </section>

      <section className="pb-16">
        <h2 className="font-heading mb-6 text-xl font-semibold tracking-tight">
          Latest products
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
