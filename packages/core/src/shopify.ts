import "server-only";
import type { Money, SearchSuggestion } from "./catalog";

const STORE = process.env.SHOPIFY_STORE_DOMAIN!;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-01";

// Each brand app has its own .env. Token resolution allows either a single
// shared token (SHOPIFY_PRIVATE_TOKEN) or a per-brand one
// (SHOPIFY_PRIVATE_TOKEN_<HANDLE>) when brands use separate Headless storefronts.
function tokensFor(brandHandle: string) {
  const key = brandHandle.toUpperCase().replace(/-/g, "_");
  return {
    publicToken:
      process.env[`SHOPIFY_PUBLIC_TOKEN_${key}`] ?? process.env.SHOPIFY_PUBLIC_TOKEN,
    privateToken:
      process.env[`SHOPIFY_PRIVATE_TOKEN_${key}`] ?? process.env.SHOPIFY_PRIVATE_TOKEN,
  };
}

/**
 * Cache control for a Storefront read.
 * - Catalog reads (home/product/collection) are cached + tagged so a Shopify
 *   webhook can purge them on demand. This is what keeps the Storefront API
 *   from being hammered across 9 storefronts on the Basic plan's lower limits.
 * - Cart reads/mutations must always be live → pass `{ noStore: true }`.
 */
export type StorefrontCache = {
  noStore?: boolean;
  revalidate?: number;
  tags?: string[];
};

/** Shared cache-tag conventions so reads and the revalidation route agree. */
export const cacheTags = {
  brand: (handle: string) => `brand:${handle}`,
  product: (handle: string) => `product:${handle}`,
};

export async function storefront<T>(
  brandHandle: string,
  query: string,
  variables: Record<string, unknown> = {},
  cacheOpts: StorefrontCache = {}
): Promise<T> {
  const { publicToken, privateToken } = tokensFor(brandHandle);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (privateToken) headers["Shopify-Storefront-Private-Token"] = privateToken;
  else if (publicToken) headers["X-Shopify-Storefront-Access-Token"] = publicToken;
  else throw new Error("No Storefront API token configured. Check the app's .env.");

  // Retry only transient *connection* failures (timeouts/resets), and only for
  // cached reads — never for cart mutations (`noStore`), where a retry after the
  // request may have reached Shopify could double-apply. GraphQL/HTTP errors are
  // deterministic and are thrown without retry.
  //
  // A healthy Shopify response is ~300ms, so we abort a stalled attempt at 8s
  // (before undici's 10s connect timeout) and cycle quickly — this rides out the
  // short connectivity drops seen in flaky dev networks. No effect in production.
  const maxAttempts = cacheOpts.noStore ? 1 : 2;
  const perAttemptTimeoutMs = 6000;
  let lastNetworkError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), perAttemptTimeoutMs);
    let res: Response;
    try {
      res = await fetch(`https://${STORE}/api/${API_VERSION}/graphql.json`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
        signal: ac.signal,
        ...(cacheOpts.noStore
          ? { cache: "no-store" as const }
          : {
              next: {
                revalidate: cacheOpts.revalidate ?? 300,
                tags: cacheOpts.tags ?? [],
              },
            }),
      });
    } catch (err) {
      // Network-level failure (connect timeout / abort / reset) — safe to retry.
      lastNetworkError = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    const json = await res.json();
    if (!res.ok || json.errors) {
      throw new Error(`Storefront API error: ${JSON.stringify(json.errors ?? json)}`);
    }
    return json.data as T;
  }

  // Unreachable in practice (loop either returns or throws), but keeps TS happy.
  throw lastNetworkError ?? new Error("Storefront request failed");
}

/* ---------- queries ---------- */

const PRODUCT_CARD = /* GraphQL */ `
  fragment ProductCard on Product {
    id
    handle
    title
    vendor
    availableForSale
    featuredImage { url(transform: { maxWidth: 800 }) altText }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    variants(first: 1) { nodes { id } }
  }
`;

export const BRAND_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD}
  query BrandProducts($collection: String!, $first: Int = 12) {
    collection(handle: $collection) {
      title
      products(first: $first) { nodes { ...ProductCard } }
    }
  }
`;

/**
 * Title-prefix product search powering the header autocomplete. Uses a
 * `title:<term>*` query (prefix match on the product title) which gives precise,
 * "as-you-type" results — unlike Shopify's `predictiveSearch`, which depends on a
 * separate search index that can be empty/stale. Lightweight fields so it can run
 * on every (debounced) keystroke.
 */
export const SEARCH_SUGGESTIONS_QUERY = /* GraphQL */ `
  query SearchSuggestions($query: String!, $first: Int = 6) {
    products(first: $first, query: $query) {
      nodes {
        id
        handle
        title
        featuredImage { url(transform: { maxWidth: 120 }) altText }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
`;

/**
 * Product suggestions for the search-bar autocomplete. Returns [] for very short
 * or failing queries so the caller (an API route) never throws. Short-cached so
 * repeated keystrokes for the same term don't re-hit Shopify.
 */
export async function predictiveSearchProducts(
  brandHandle: string,
  query: string
): Promise<SearchSuggestion[]> {
  const term = query.trim();
  if (term.length < 2) return [];
  // Strip characters that would break Shopify's search-query syntax, then match
  // as a title prefix.
  const safe = term.replace(/["\\():*~^{}[\]]/g, " ").trim();
  if (!safe) return [];
  try {
    const data = await storefront<{ products: { nodes: SearchSuggestion[] } }>(
      brandHandle,
      SEARCH_SUGGESTIONS_QUERY,
      { query: `title:${safe}*`, first: 6 },
      { revalidate: 60, tags: [cacheTags.brand(brandHandle)] }
    );
    return data.products.nodes;
  } catch {
    return [];
  }
}

export const ALL_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD}
  query AllProducts($first: Int = 24) {
    products(first: $first, sortKey: BEST_SELLING) {
      nodes { ...ProductCard }
    }
  }
`;

/** Products inside any collection (category page reuses the brand fragment). */
export const COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD}
  query CollectionProducts($handle: String!, $first: Int = 24) {
    collection(handle: $handle) {
      title
      description
      products(first: $first) { nodes { ...ProductCard } }
    }
  }
`;

/** Full-text product search across the storefront. */
export const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD}
  query SearchProducts($query: String!, $first: Int = 36) {
    products(first: $first, query: $query) { nodes { ...ProductCard } }
  }
`;

/**
 * Storefront collections — feeds the homepage category grid and the drawer.
 * Fetches up to 250 (the API max) so no category is cut off, plus the
 * `custom.parent` metafield that drives the category → subcategory hierarchy.
 */
export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int = 250) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        image { url(transform: { maxWidth: 200 }) altText }
        parent: metafield(namespace: "custom", key: "parent") { value }
      }
    }
  }
`;

export const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      vendor
      descriptionHtml
      tags
      availableForSale
      featuredImage { url(transform: { maxWidth: 1200 }) altText }
      images(first: 8) { nodes { url(transform: { maxWidth: 1200 }) altText } }
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      variants(first: 20) {
        nodes {
          id
          title
          availableForSale
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
        }
      }
    }
  }
`;

const CART_FIELDS = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost { totalAmount { amount currencyCode } }
    lines(first: 50) {
      nodes {
        id
        quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            image { url(transform: { maxWidth: 200 }) altText }
            product { title handle featuredImage { url(transform: { maxWidth: 200 }) altText } }
          }
        }
      }
    }
  }
`;

export const CART_QUERY = /* GraphQL */ `
  ${CART_FIELDS}
  query Cart($id: ID!) { cart(id: $id) { ...CartFields } }
`;

export const CART_CREATE = /* GraphQL */ `
  ${CART_FIELDS}
  mutation CartCreate($lines: [CartLineInput!]!, $attributes: [AttributeInput!]) {
    cartCreate(input: { lines: $lines, attributes: $attributes }) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_ADD = /* GraphQL */ `
  ${CART_FIELDS}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_UPDATE = /* GraphQL */ `
  ${CART_FIELDS}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

export const CART_LINES_REMOVE = /* GraphQL */ `
  ${CART_FIELDS}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      userErrors { field message }
    }
  }
`;

/* ---------- types ---------- */

// Pure types + helpers live in catalog.ts (no server-only) so client components
// can use them too. Re-exported here for existing `from "./shopify"` imports.
export {
  type Money,
  type ProductCard,
  type CollectionSummary,
  type RawCollectionNode,
  type CategoryNode,
  type SearchSuggestion,
  discountPercent,
  visibleCollections,
  buildCategoryTree,
  formatPrice,
} from "./catalog";

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { totalAmount: Money };
      merchandise: {
        id: string;
        title: string;
        price: Money;
        image: { url: string; altText: string | null } | null;
        product: {
          title: string;
          handle: string;
          featuredImage: { url: string; altText: string | null } | null;
        };
      };
    }[];
  };
};
