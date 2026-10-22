import {SALE_PRODUCTS_QUERY,SALE_VARIANTS_QUERY} from "./promotions-query";
import "server-only";
import {restrictCatalog} from "./homedicalVisibility";
import { sellable } from "./catalog";
import type { Money, SearchSuggestion } from "./catalog";
import { requestStorefront, type StorefrontCache } from "./storefront-request";

const STORE = process.env.SHOPIFY_STORE_DOMAIN!;
const API_VERSION = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? process.env.SHOPIFY_API_VERSION ?? "2026-07";

// Each brand app has its own .env. Only explicit Storefront token names may
// authorize Storefront API requests; revalidation secrets are intentionally excluded.
function tokensFor(brandHandle: string) {
  const key = brandHandle.toUpperCase().replace(/-/g, "_");
  return {
    publicToken:
      process.env[`SHOPIFY_PUBLIC_TOKEN_${key}`] ?? process.env.SHOPIFY_PUBLIC_TOKEN,
    privateToken:
      process.env[`SHOPIFY_STOREFRONT_PRIVATE_TOKEN_${key}`] ??
      process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
  };
}

export function hasStorefrontToken(brandHandle: string): boolean {
  const { publicToken, privateToken } = tokensFor(brandHandle);
  return Boolean(publicToken || privateToken);
}

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
  const candidateOnly = process.env.NEXT_PUBLIC_ARVOALUX_PUBLIC_BROWSING === '1';
  if (candidateOnly && (brandHandle !== 'arvoalux' || process.env.STOREFRONT_APP_BRAND !== 'arvoalux' ||
      process.env.SHOPIFY_CATALOG_CHANNEL !== 'storefront-public-read' ||
      ((process.env.VERCEL_ENV === 'production' || process.env.VERCEL_TARGET_ENV === 'production') &&
       (process.env.ARVOALUX_BROWSING_RELEASE !== '1' || process.env.NEXT_PUBLIC_ARVOALUX_REVIEW_ONLY !== '0' || process.env.NEXT_PUBLIC_ARVOALUX_COMMERCE !== '1' || process.env.NEXT_PUBLIC_ARVOA_COMMERCE !== '1')))) throw new Error('Lux candidate binding mismatch');
  const { publicToken, privateToken } = candidateOnly ? { publicToken: undefined, privateToken: undefined } : tokensFor(brandHandle);
  if (!STORE) throw new Error("No Shopify store domain configured. Check the app's environment.");
  const result = await requestStorefront<T>({
    store: STORE,
    apiVersion: API_VERSION,
    query,
    variables,
    cacheOpts,
    publicToken,
    privateToken,
  });
  return restrictCatalog(result,brandHandle);
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
    return sellable(data.products.nodes);
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

/** ArvoaLux-only category pagination; legacy sibling documents remain unchanged. */
export const ARVOALUX_COLLECTION_PAGE_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD}
  query ArvoaluxCollectionPage($handle: String!, $first: Int = 48, $after: String) {
    collection(handle: $handle) {
      title
      description
      products(first: $first, after: $after, sortKey: COLLECTION_DEFAULT) {
        nodes { ...ProductCard }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

export const ARVOALUX_ALL_PRODUCTS_PAGE_QUERY = /* GraphQL */ `
  ${PRODUCT_CARD}
  query ArvoaluxAllProductsPage($first: Int = 48, $after: String) {
    products(first: $first, after: $after, sortKey: BEST_SELLING) {
      nodes { ...ProductCard }
      pageInfo { hasNextPage endCursor }
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

/** Public-only collection query for tokenless Storefront access. */
export const COLLECTIONS_QUERY_TOKENLESS = /* GraphQL */ `
  query CollectionsTokenless($first: Int = 250) {
    collections(first: $first) {
      nodes {
        id
        handle
        title
        image { url(transform: { maxWidth: 200 }) altText }
      }
    }
  }
`;

export const COLLECTIONS_PAGE_QUERY = /* GraphQL */ `
  query CatalogCollectionsPage($after: String) {
    collections(first: 250, after: $after, sortKey: ID) {
      nodes { id handle title image { url(transform: { maxWidth: 200 }) altText } }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

/** Complete public collection inventory; no Admin/metafield credentials. */
export async function loadCatalogCollections(brandHandle: string): Promise<import('./catalog').RawCollectionNode[]> {
  const nodes: import('./catalog').RawCollectionNode[] = [];
  const ids = new Set<string>();
  const cursors = new Set<string>();
  let after: string | undefined;
  while (true) {
    const data = await storefront<{ collections: { nodes: import('./catalog').RawCollectionNode[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } } }>(brandHandle, COLLECTIONS_PAGE_QUERY, { after }, { tags: [cacheTags.brand(brandHandle)] });
    for (const node of data.collections.nodes) {
      if (ids.has(node.id)) throw new Error('Duplicate collection identity');
      ids.add(node.id); nodes.push(node);
    }
    const page = data.collections.pageInfo;
    if (!page.hasNextPage) return nodes;
    if (!page.endCursor || cursors.has(page.endCursor) || !data.collections.nodes.length) throw new Error('Collection cursor did not advance');
    after = page.endCursor; cursors.add(after);
  }
}

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
  sellable,
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
