import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
};

// Placeholder until Phase 3 (Product CRUD) replaces this with the real list.
export default function AdminProductsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Products
      </h1>
      <p className="mt-2 text-muted-foreground">
        Product management is coming soon.
      </p>
    </div>
  );
}
