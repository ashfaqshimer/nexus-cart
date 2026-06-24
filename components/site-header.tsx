import Link from "next/link";

import { CartSheet } from "@/components/cart/cart-sheet";
import { SearchBox } from "@/components/search/search-box";
import { buttonVariants } from "@/components/ui/button";
import { getCategories } from "@/lib/queries/categories";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-lg font-semibold tracking-tight">
              Nexus<span className="text-muted-foreground">Cart</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              All products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>

        <SearchBox className="hidden flex-1 md:block md:max-w-xs" />

        <nav className="flex items-center gap-1">
          <Link
            href="/categories"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "md:hidden",
            )}
          >
            Categories
          </Link>
          <CartSheet />
        </nav>
      </div>
    </header>
  );
}
