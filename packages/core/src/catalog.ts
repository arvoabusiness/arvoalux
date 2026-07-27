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
  /** Handle of the parent collection (from the `custom.parent` metafield), or null for top-level. */
  parent: string | null;
};

/** Raw collection node as returned by COLLECTIONS_QUERY — parent arrives as a metafield object. */
export type RawCollectionNode = Omit<CollectionSummary, "parent"> & {
  parent: { value: string | null } | null;
};

/** A top-level category with its direct subcategories, built from the flat list. */
export type CategoryNode = CollectionSummary & { children: CollectionSummary[] };

/** A single product suggestion for the search-bar autocomplete dropdown. */
export type SearchSuggestion = {
  id: string;
  handle: string;
  title: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: Money };
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

/**
 * Drop the per-brand `brand-<handle>` collections and Shopify's default
 * frontpage, and flatten the `custom.parent` metafield into a plain handle.
 */
export function visibleCollections(nodes: RawCollectionNode[]): CollectionSummary[] {
  return nodes
    .filter((c) => c.handle !== "frontpage" && !c.handle.startsWith("brand-"))
    .map((c) => ({
      id: c.id,
      handle: c.handle,
      title: c.title,
      image: c.image,
      parent: c.parent?.value ?? null,
    }));
}

/**
 * Group a flat collection list into a two-level tree using the `parent` handle.
 * A collection whose parent isn't in the visible set is treated as top-level, so
 * nothing is ever dropped. Children are sorted alphabetically; roots keep the
 * Shopify order.
 */
export function buildCategoryTree(cols: CollectionSummary[]): CategoryNode[] {
  const byHandle = new Set(cols.map((c) => c.handle));
  const childrenOf = new Map<string, CollectionSummary[]>();
  for (const c of cols) {
    if (c.parent && byHandle.has(c.parent)) {
      const list = childrenOf.get(c.parent) ?? [];
      list.push(c);
      childrenOf.set(c.parent, list);
    }
  }
  const roots: CategoryNode[] = [];
  for (const c of cols) {
    if (!c.parent || !byHandle.has(c.parent)) {
      const children = (childrenOf.get(c.handle) ?? []).sort((a, b) =>
        a.title.localeCompare(b.title, "hu")
      );
      roots.push({ ...c, children });
    }
  }
  return roots;
}

/**
 * Products that are actually for sale. Hides not-ready items — currently any
 * product with no real price (0), e.g. the SAA & CRP rapid test the client asked
 * to pull. Reversible: a product reappears the moment it has a valid price.
 */
export function sellable<T extends { priceRange: { minVariantPrice: Money } }>(
  products: T[]
): T[] {
  return products.filter((p) => Number(p.priceRange.minVariantPrice.amount) > 0);
}

export function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "HUF" ? 0 : 2,
  }).format(Number(amount));
}
