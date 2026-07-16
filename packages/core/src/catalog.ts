/**
 * Pure catalog types and helpers — no `server-only`, so both Server and Client
 * Components can import these. The network/token-bearing code lives in shopify.ts.
 */

export type Money = { amount: string; currencyCode: string };

export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  vendor: string | null;
  availableForSale: boolean;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money } | null;
  variants: { nodes: { id: string }[] };
};

export type CollectionSummary = {
  id: string;
  handle: string;
  title: string;
  image: { url: string; altText: string | null } | null;
};

/**
 * Discount percent off the compare-at price, or null when not on sale.
 * Storefront returns compareAt as "0.0" (not null) when there's no sale.
 */
export function discountPercent(p: ProductCard): number | null {
  const price = Number(p.priceRange.minVariantPrice.amount);
  const compare = Number(p.compareAtPriceRange?.minVariantPrice.amount ?? 0);
  if (!compare || compare <= price) return null;
  return Math.round(((compare - price) / compare) * 100);
}

/** Drop the per-brand `brand-<handle>` collections and Shopify's default frontpage. */
export function visibleCollections(nodes: CollectionSummary[]): CollectionSummary[] {
  return nodes.filter((c) => c.handle !== "frontpage" && !c.handle.startsWith("brand-"));
}

export function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "HUF" ? 0 : 2,
  }).format(Number(amount));
}
