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
  params,
}: {
  basePath: string;
  active: ProductSortValue;
  /**
   * Extra query params to preserve on every sort link (e.g. the `q` of a search
   * page). "newest" still omits `sort` to keep that URL canonical, but these
   * params are always carried through.
   */
  params?: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort</span>
      {SORT_OPTIONS.map((option) => {
        const search = new URLSearchParams(params);
        if (option.value !== "newest") {
          search.set("sort", option.value);
        }
        const queryString = search.toString();
        const href = queryString ? `${basePath}?${queryString}` : basePath;
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
