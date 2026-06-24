"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { Search } from "lucide-react";

import type { SearchSuggestion } from "@/app/api/search/route";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 200;

/**
 * Header search island. As you type it queries `/api/search` and shows a
 * typeahead dropdown of products (each a link to its detail page); pressing
 * Enter or clicking "See all results" navigates to the full /search page. The
 * surrounding header stays a server component — only this child is client-side.
 */
export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchSuggestion[]>([]);
  const [isPending, startTransition] = React.useTransition();

  const abortRef = React.useRef<AbortController | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmed = query.trim();

  const runSearch = React.useCallback((value: string) => {
    abortRef.current?.abort();

    if (value.trim() === "") {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(value)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data: SearchSuggestion[] = await response.json();
        if (!controller.signal.aborted) {
          setResults(data);
        }
      } catch {
        // Ignore aborted/failed requests; the dropdown just shows no results.
      }
    });
  }, []);

  function handleValueChange(value: string) {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), DEBOUNCE_MS);
  }

  function goToResults() {
    if (trimmed === "") return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // When the query is blank there is nothing to show; keep the popup closed.
  const showPopup = trimmed !== "";

  return (
    <Autocomplete.Root
      items={results}
      value={query}
      onValueChange={(value, details) => {
        // Selecting an item navigates away (the item is a link); don't let it
        // overwrite the query text.
        if (details.reason === "item-press") return;
        handleValueChange(value);
      }}
      itemToStringValue={(item: SearchSuggestion) => item.name}
      filter={null}
    >
      <form
        role="search"
        className={cn("relative", className)}
        onSubmit={(event) => {
          event.preventDefault();
          goToResults();
        }}
      >
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Autocomplete.Input
          aria-label="Search products"
          placeholder="Search products…"
          className="h-9 w-full min-w-0 rounded-lg border border-input bg-transparent pl-8 pr-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        />
      </form>

      <Autocomplete.Portal hidden={!showPopup}>
        <Autocomplete.Positioner
          className="z-50 outline-none"
          sideOffset={6}
          align="start"
        >
          <Autocomplete.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md">
            <Autocomplete.Status className="px-3 py-2 text-xs text-muted-foreground">
              {isPending
                ? "Searching…"
                : results.length === 0
                  ? `No products match "${trimmed}"`
                  : null}
            </Autocomplete.Status>

            <Autocomplete.List className="max-h-[min(24rem,var(--available-height))] overflow-y-auto overscroll-contain py-1">
              {(item: SearchSuggestion) => (
                <Autocomplete.Item
                  key={item.id}
                  value={item}
                  render={<Link href={`/products/${item.slug}`} />}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{item.name}</span>
                    {item.categoryName ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {item.categoryName}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatPrice(item.price)}
                  </span>
                </Autocomplete.Item>
              )}
            </Autocomplete.List>

            {trimmed !== "" ? (
              <Link
                href={`/search?q=${encodeURIComponent(trimmed)}`}
                className="block border-t px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                See all results for &ldquo;{trimmed}&rdquo;
              </Link>
            ) : null}
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
