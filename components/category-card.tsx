import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import type { CategoryListItem } from "@/lib/queries/categories";

export function CategoryCard({ category }: { category: CategoryListItem }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="h-full transition-shadow group-hover:ring-foreground/20">
        <CardContent className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-snug">
            {category.name}
          </h3>
          {category.description ? (
            <p className="text-sm text-muted-foreground">
              {category.description}
            </p>
          ) : null}
          <span className="mt-1 text-xs text-muted-foreground">
            {category.productCount}{" "}
            {category.productCount === 1 ? "item" : "items"}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
