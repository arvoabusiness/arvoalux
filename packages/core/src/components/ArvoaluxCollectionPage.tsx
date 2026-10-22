import type { Brand } from "../types";
import { storefront, ARVOALUX_COLLECTION_PAGE_QUERY, ARVOALUX_ALL_PRODUCTS_PAGE_QUERY, cacheTags, type ProductCard } from "../shopify";
import { ArvoaluxCollectionView } from "./ArvoaluxCollectionView";

export type CollectionSearchParams = Record<string, string | string[] | undefined>;
type Connection = { nodes: ProductCard[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } };

/** Server links deliberately work without hydration, observers, or client state. */
export async function ArvoaluxCollectionPage({ brand, handle, searchParams = {} }: {
  brand: Brand; handle: string; searchParams?: CollectionSearchParams;
}) {
  const after = typeof searchParams.after === "string" ? searchParams.after : undefined;
  let title = "Termékek";
  let description = "";
  let products: ProductCard[] = [];
  let nextCursor: string | null = null;
  let failed = false;
  try {
    if (searchParams.after !== undefined && (typeof searchParams.after !== "string" || searchParams.after.length > 2048)) {
      throw new Error("Invalid pagination cursor");
    }
    const data = await storefront<{ collection: { title: string; description: string; products: Connection } | null }>(
      brand.handle, ARVOALUX_COLLECTION_PAGE_QUERY, { handle, first: 48, after },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    let connection = data.collection?.products;
    if (data.collection) {
      title = data.collection.title;
      description = data.collection.description;
    } else if (handle === brand.collectionHandle) {
      const all = await storefront<{ products: Connection }>(
        brand.handle, ARVOALUX_ALL_PRODUCTS_PAGE_QUERY, { first: 48, after },
        { tags: [cacheTags.brand(brand.handle)] }
      );
      connection = all.products;
    }
    if (connection) {
      products = connection.nodes;
      nextCursor = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
      if (connection.pageInfo.hasNextPage && (!nextCursor || nextCursor === after || !products.length)) {
        throw new Error("Pagination cursor did not advance");
      }
    }
  } catch {
    products = [];
    nextCursor = null;
    failed = true;
  }
  const base = `/collections/${encodeURIComponent(handle)}`;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "after" || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, item);
  }
  const firstHref = base + (params.size ? `?${params}` : "");
  const retryParams = new URLSearchParams(params);
  if (after) retryParams.set("after", after);
  const retryHref = base + (retryParams.size ? `?${retryParams}` : "");
  if (nextCursor) params.set("after", nextCursor);
  return <ArvoaluxCollectionView title={title} description={description} products={products}
    brandHandle={brand.handle} failed={failed} after={after} nextCursor={nextCursor}
    firstHref={firstHref} retryHref={retryHref} nextHref={`${base}?${params}`} />;
}
