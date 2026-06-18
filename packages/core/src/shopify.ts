import "server-only";
import type { Money } from "./catalog";

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

  const res = await fetch(`https://${STORE}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    ...(cacheOpts.noStore
      ? { cache: "no-store" as const }
      : {
          next: {
            revalidate: cacheOpts.revalidate ?? 300,
            tags: cacheOpts.tags ?? [],
          },
        }),
  });

  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`Storefront API error: ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.data as T;
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

/** Storefront collections — feeds the homepage category grid and the drawer. */
export const COLLECTIONS_QUERY = /* GraphQL */ `
  query Collections($first: Int = 50) {
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
  discountPercent,
  visibleCollections,
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
