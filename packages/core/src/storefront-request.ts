import { createHash } from "node:crypto";

// Exact audited catalog documents in shopify.ts, not a GraphQL keyword denylist.
// Intentional fail-closed pin: query edits require explicit review and pin update.
// Variables remain separate JSON values and cannot change document structure.
const REVIEW_CATALOG_DOCUMENTS = new Set([
  "4eb7f0d067fdc84fee376ee620f6d5e8eddfa7161274c0c495b228e4fdb6dceb", // Exact read-only Merchant catalog query, public product fields only
  "161dc268be3475d7857940793db30e0ca04a59c3da4d6b1659a2acb2a9cbc17b", // Audited public SKU/type/barcode read
  "7514a8e11cf685b75201cc9d39dacb0e5559fa9956cf2f65beaa1d404fc5b485", // Audited public filter metadata read
  "5cab291e7fbcf295025964c3821aff60d37966f5ae08873934070c77509d4a61", // Audited public filter metadata read

  "d66824d44e58ad2270fa3479584e6aa4fb01aa23adba2525e55cc6e71210ef1b", // Explicit public sale product/variant read
  "0edabcda7fec3cdb7c165930803572f1b2ce49e0a8da683f5ac01fcb0355430d", // Explicit public variant pagination read
  "895b90e53ceafed3f72146bd621573e3db65803050f539190aa7d9c407f6bb1f", // COLLECTIONS_PAGE_QUERY: public identity/image + cursor only
  "08a9a40f5ef86ee386aa54ab13868311bc6c89e585219bcffd872505d74b07d2", // OwnerSelection exact public product/variant read
  "9ae8dbb49f799fab2d56b69d4872146215e3d33832b03aaacb6eb511edfaddce", // heroData.ts buildHeroQuery(7): product/collection public fields only
  "3da6c20d1085273b1f32b65e0d75c84e7b3b03acc1ddd2094e6edb527171bffe", // ARVOALUX_COLLECTION_PAGE_QUERY
  "42459081aa918b44564c0f2960d3ef2796c09967531b243f0ceae1f1bb9dd9ee", // ARVOALUX_ALL_PRODUCTS_PAGE_QUERY
  "c3ab0a691c5b657f2fa36f166f312383866783248e71ae9fc366dda32433236e", // BRAND_PRODUCTS_QUERY
  "fb81e4c22c7094e90ac6448165a6a2e59a5320775aedd0db079c2ad00cf32c7b", // SEARCH_SUGGESTIONS_QUERY
  "b3f4ebf143bf2270a97b6bb4e501142d235c45508dc0dcd4b108eacfc9b04b47", // ALL_PRODUCTS_QUERY
  "c81a398535e944ba8a73731016c44b94d77f4c13113243044ec4c9a41be68c0e", // COLLECTION_PRODUCTS_QUERY
  "ce0dfd4f758bb5dd517dcf6c3f665062b75cd7974f18b60df1ad2ecf68dca402", // SEARCH_PRODUCTS_QUERY
  "935a36ee7d5598377b57e41f119a0283a7415c77b958b76ec5b81a7d7ff8da89", // COLLECTIONS_QUERY
  "584d10d84a34a1b80db81240cd1c58cc914cfa8b9546c8f70e010529c13fa96e", // COLLECTIONS_QUERY_TOKENLESS
  "5fa06b64e7ab92af83bdf79207c10053a65ce454f9ce33a592b37c1370863718", // PRODUCT_QUERY
]);

const COMMERCE_CART_DOCUMENTS = new Set([
  "68ebad2644ebbef2856a9b47bf4a1ac359898c85cd242c7b141f2f5f940a5ab9", // cart read
  "2be38384c673a6cb5cd10ba7ec615c7103860d4ffd6322e28b02d4aafa1530c7", // create
  "ad08e54027040465e20625f23a56a491e12b917fdc3fc7812080f687014d81d6", // add
  "bff0684ae602657529c6043cd10642baa8ef16d9466b832f068447a39eb769f4", // update
  "8df35c1a09783821a91b94bc9da4ffeefc7da228b71b095f141643c7213ef5d6", // remove
]);

export type StorefrontCache = {
  noStore?: boolean;
  revalidate?: number;
  tags?: string[];
  /** Public-safe equivalent for requests whose auth-only fields are unavailable. */
  tokenlessQuery?: string;
};

type StorefrontRequest<T> = {
  store: string;
  apiVersion: string;
  query: string;
  variables?: Record<string, unknown>;
  cacheOpts?: StorefrontCache;
  publicToken?: string;
  privateToken?: string;
  fetchImpl?: typeof fetch;
};

type StorefrontError = { extensions?: { code?: string } };
type StorefrontPayload<T> = { data?: T; errors?: StorefrontError[] };
type NextRequestInit = RequestInit & {
  next?: { revalidate: number; tags: string[] };
};

export async function requestStorefront<T>({
  store,
  apiVersion,
  query,
  variables = {},
  cacheOpts = {},
  publicToken,
  privateToken,
  fetchImpl = fetch,
}: StorefrontRequest<T>): Promise<T> {
  const publicBrowsing = process.env.NEXT_PUBLIC_ARVOALUX_PUBLIC_BROWSING === "1";
  const commerce = process.env.NEXT_PUBLIC_ARVOALUX_COMMERCE === "1";
  if ((publicBrowsing || commerce) && (store !== "arvoalux.myshopify.com" || apiVersion !== "2026-07")) {
    throw new Error("Public catalog binding mismatch");
  }
  const reviewOnly = publicBrowsing || process.env.NEXT_PUBLIC_ARVOALUX_REVIEW_ONLY === "1";
  const tokenlessQuery = cacheOpts.tokenlessQuery;
  const assertReadOnly = (document: string) => {
    if (commerce && !REVIEW_CATALOG_DOCUMENTS.has(createHash("sha256").update(document).digest("hex")) &&
        !COMMERCE_CART_DOCUMENTS.has(createHash("sha256").update(document).digest("hex"))) {
      throw new Error("Commerce: only approved catalog/cart documents allowed");
    }
    if (reviewOnly && (typeof document !== "string" ||
        !REVIEW_CATALOG_DOCUMENTS.has(createHash("sha256").update(document).digest("hex")))) {
      throw new Error("Review-only: only approved catalog queries allowed; cart reads and business writes disabled");
    }
  };
  // Validate both inputs before even an authenticated initial request can run.
  assertReadOnly(query);
  if (tokenlessQuery !== undefined) assertReadOnly(tokenlessQuery);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (privateToken) headers["Shopify-Storefront-Private-Token"] = privateToken;
  else if (publicToken) headers["X-Shopify-Storefront-Access-Token"] = publicToken;

  const noStore = cacheOpts.noStore || (commerce && COMMERCE_CART_DOCUMENTS.has(createHash("sha256").update(query).digest("hex")));
  const maxAttempts = noStore ? 1 : 2;
  const perAttemptTimeoutMs = 6000;

  const executeRequest = async (
    requestHeaders: Record<string, string>,
    requestQuery: string
  ): Promise<{ res: Response; json: StorefrontPayload<T> }> => {
    let lastNetworkError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      assertReadOnly(requestQuery); // Exact outgoing document, including fallback and retries.
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), perAttemptTimeoutMs);
      try {
        const init: NextRequestInit = {
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify({ query: requestQuery, variables }),
          signal: ac.signal,
          ...(noStore
            ? { cache: "no-store" as const }
            : {
                next: {
                  revalidate: cacheOpts.revalidate ?? 300,
                  tags: cacheOpts.tags ?? [],
                },
              }),
        };
        const res = await fetchImpl(
          `https://${store}/api/${apiVersion}/graphql.json`,
          init
        );
        return { res, json: await res.json() as StorefrontPayload<T> };
      } catch (err) {
        lastNetworkError = err;
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
          continue;
        }
        throw err;
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastNetworkError ?? new Error("Storefront request failed");
  };

  const initialQuery = !privateToken && !publicToken && tokenlessQuery
    ? tokenlessQuery
    : query;
  let { res, json } = await executeRequest(headers, initialQuery);
  const hasAccessDenied = Array.isArray(json.errors) && json.errors.some(
    (error) => error.extensions?.code === "ACCESS_DENIED"
  );

  if ((!res.ok || json.errors) && privateToken && hasAccessDenied) {
    const tokenlessHeaders: Record<string, string> = { "Content-Type": "application/json" };
    ({ res, json } = await executeRequest(
      tokenlessHeaders,
      tokenlessQuery ?? query
    ));
  }

  if (!res.ok || json.errors || json.data === undefined) {
    throw new Error(`Storefront API error: ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.data;
}
