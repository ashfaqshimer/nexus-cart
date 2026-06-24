import { type NextRequest, NextResponse } from "next/server";

import { searchProducts } from "@/lib/queries/products";

// How many suggestions the header typeahead shows.
const TYPEAHEAD_LIMIT = 6;

export type SearchSuggestion = {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  categoryName: string | null;
};

/**
 * Typeahead endpoint for the header search box. Returns a small set of product
 * suggestions matching `?q=`. The full /search page reads the DB directly, so
 * this handler exists only for the as-you-type dropdown. Reading `searchParams`
 * opts the route into dynamic rendering automatically.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  const products = await searchProducts(query, "newest", TYPEAHEAD_LIMIT);

  const suggestions: SearchSuggestion[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    image: product.images[0] ?? null,
    categoryName: product.categoryName,
  }));

  return NextResponse.json(suggestions);
}
