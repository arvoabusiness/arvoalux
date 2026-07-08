import type { Brand } from "../../types";
import {
  storefront,
  BRAND_PRODUCTS_QUERY,
  ALL_PRODUCTS_QUERY,
  cacheTags,
  type ProductCard as ProductCardData,
} from "../../shopify";
import { PaginatedProductGrid } from "../product/PaginatedProductGrid";
import { SectionHeading } from "./SectionHeading";

// Products shown per page in the Featured grid.
const PAGE_SIZE = 12;
// Pool fetched up front so pagination has multiple pages to move through.
const POOL_SIZE = 48;

export async function FeaturedProductsSection({ brand }: { brand: Brand }) {
  let products: ProductCardData[] = [];
  try {
    const data = await storefront<{ collection: { products: { nodes: ProductCardData[] } } | null }>(
      brand.handle,
      BRAND_PRODUCTS_QUERY,
      { collection: brand.collectionHandle, first: POOL_SIZE },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    products = data.collection?.products.nodes ?? [];

    // Fallback: real stores may lack the `brand-<handle>` automated collection,
    // so pull the newest products instead of letting the section vanish.
    if (products.length === 0) {
      const all = await storefront<{ products: { nodes: ProductCardData[] } }>(
        brand.handle,
        ALL_PRODUCTS_QUERY,
        { first: POOL_SIZE },
        { tags: [cacheTags.brand(brand.handle)] }
      );
      products = all.products.nodes;
    }
  } catch {
    products = [];
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white" data-testid="featured-products-section">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading title="Kiemelt termékek" ctaLabel="Összes termék" ctaHref={`/collections/${brand.collectionHandle}`} />
        <PaginatedProductGrid products={products} brandHandle={brand.handle} pageSize={PAGE_SIZE} />
      </div>
    </section>
  );
}
