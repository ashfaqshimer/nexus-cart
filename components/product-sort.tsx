import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { ProductSort as ProductSortValue } from "@/lib/queries/products";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { value: ProductSortValue; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

/**
 * Server-rendered sort control: a row of links that set `?sort=` on the current
 * route. Link-based (rather than a JS dropdown) so it works without client
 * JavaScript and keeps each sort order crawlable. "newest" is the default, so
 * it links to the bare path to keep that URL canonical.
 */
export function ProductSort({
  basePath,
  active,
}: {
  basePath: string;
  active: ProductSortValue;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort</span>
      {SORT_OPTIONS.map((option) => {
        const href =
          option.value === "newest"
            ? basePath
            : `${basePath}?sort=${option.value}`;
        return (
          <Link
            key={option.value}
            href={href}
            aria-current={option.value === active ? "true" : undefined}
            className={cn(
              buttonVariants({
                variant: option.value === active ? "default" : "outline",
                size: "sm",
              }),
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
