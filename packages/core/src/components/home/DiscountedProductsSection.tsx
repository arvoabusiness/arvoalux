import type { Brand } from "../../types";
import {
  storefront,
  BRAND_PRODUCTS_QUERY,
  ALL_PRODUCTS_QUERY,
  cacheTags,
  discountPercent,
  type ProductCard as ProductCardData,
} from "../../shopify";
import { PaginatedProductGrid } from "../product/PaginatedProductGrid";
import { SectionHeading } from "./SectionHeading";

// Sale products shown per page.
const PAGE_SIZE = 6;
// Scan the whole catalogue (Shopify's max is 250/request) for sale items —
// discounted products can sit anywhere in the sort order, so a small pool would
// miss them and hide the section. Cached, so this runs at most once per window.
const POOL_SIZE = 250;

export async function DiscountedProductsSection({ brand }: { brand: Brand }) {
  let products: ProductCardData[] = [];
  try {
    const data = await storefront<{ collection: { products: { nodes: ProductCardData[] } } | null }>(
      brand.handle,
      BRAND_PRODUCTS_QUERY,
      { collection: brand.collectionHandle, first: POOL_SIZE },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    let pool = data.collection?.products.nodes ?? [];

    // Fallback: real stores may lack the `brand-<handle>` automated collection,
    // so scan the newest products for sale items instead.
    if (pool.length === 0) {
      const all = await storefront<{ products: { nodes: ProductCardData[] } }>(
        brand.handle,
        ALL_PRODUCTS_QUERY,
        { first: POOL_SIZE },
        { tags: [cacheTags.brand(brand.handle)] }
      );
      pool = all.products.nodes;
    }

    products = pool.filter((p) => discountPercent(p) !== null);
  } catch {
    products = [];
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gray-50" data-testid="discounted-products-section">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading title="Kiárusítás!" ctaLabel="Mutasd az összeset" ctaHref={`/collections/${brand.collectionHandle}`} />
        <PaginatedProductGrid products={products} brandHandle={brand.handle} pageSize={PAGE_SIZE} />
      </div>
    </section>
  );
}
