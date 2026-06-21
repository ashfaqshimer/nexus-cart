/**
 * Format a price stored in integer cents as a localized currency string.
 * Lives in its own module (no DB imports) so it's safe to use from client
 * components.
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
