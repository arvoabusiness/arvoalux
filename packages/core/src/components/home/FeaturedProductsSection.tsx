import type { Brand } from "../../types";
import {
  storefront,
  BRAND_PRODUCTS_QUERY,
  cacheTags,
  type ProductCard as ProductCardData,
} from "../../shopify";
import { ProductCard } from "../product/ProductCard";
import { SectionHeading } from "./SectionHeading";

export async function FeaturedProductsSection({ brand }: { brand: Brand }) {
  let products: ProductCardData[] = [];
  try {
    const data = await storefront<{ collection: { products: { nodes: ProductCardData[] } } | null }>(
      brand.handle,
      BRAND_PRODUCTS_QUERY,
      { collection: brand.collectionHandle, first: 8 },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    products = data.collection?.products.nodes ?? [];
  } catch {
    products = [];
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white" data-testid="featured-products-section">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading title="Kiemelt termékek" ctaLabel="Összes termék" ctaHref={`/collections/${brand.collectionHandle}`} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} brandHandle={brand.handle} />
          ))}
        </div>
      </div>
    </section>
  );
}
