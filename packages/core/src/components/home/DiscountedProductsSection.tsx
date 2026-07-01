import type { Brand } from "../../types";
import {
  storefront,
  BRAND_PRODUCTS_QUERY,
  ALL_PRODUCTS_QUERY,
  cacheTags,
  discountPercent,
  type ProductCard as ProductCardData,
} from "../../shopify";
import { ProductCard } from "../product/ProductCard";
import { SectionHeading } from "./SectionHeading";

export async function DiscountedProductsSection({ brand }: { brand: Brand }) {
  let products: ProductCardData[] = [];
  try {
    const data = await storefront<{ collection: { products: { nodes: ProductCardData[] } } | null }>(
      brand.handle,
      BRAND_PRODUCTS_QUERY,
      { collection: brand.collectionHandle, first: 24 },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    let pool = data.collection?.products.nodes ?? [];

    // Fallback: real stores may lack the `brand-<handle>` automated collection,
    // so scan the newest products for sale items instead.
    if (pool.length === 0) {
      const all = await storefront<{ products: { nodes: ProductCardData[] } }>(
        brand.handle,
        ALL_PRODUCTS_QUERY,
        { first: 24 },
        { tags: [cacheTags.brand(brand.handle)] }
      );
      pool = all.products.nodes;
    }

    products = pool.filter((p) => discountPercent(p) !== null).slice(0, 8);
  } catch {
    products = [];
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-gray-50" data-testid="discounted-products-section">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading title="Kiárusítás!" ctaLabel="Mutasd az összeset" ctaHref={`/collections/${brand.collectionHandle}`} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} brandHandle={brand.handle} />
          ))}
        </div>
      </div>
    </section>
  );
}
