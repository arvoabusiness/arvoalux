import "server-only";

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

export async function storefront<T>(
  brandHandle: string,
  query: string,
  variables: Record<string, unknown> = {}
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
    cache: "no-store",
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
    featuredImage { url(transform: { maxWidth: 800 }) altText }
    priceRange { minVariantPrice { amount currencyCode } }
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

export const PRODUCT_QUERY = /* GraphQL */ `
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
      tags
      featuredImage { url(transform: { maxWidth: 1200 }) altText }
      variants(first: 20) {
        nodes { id title availableForSale price { amount currencyCode } }
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
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            product { title handle }
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

/* ---------- types ---------- */

export type ProductCard = {
  id: string;
  handle: string;
  title: string;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      merchandise: {
        id: string;
        title: string;
        price: { amount: string; currencyCode: string };
        product: { title: string; handle: string };
      };
    }[];
  };
};

export function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "HUF" ? 0 : 2,
  }).format(Number(amount));
}
