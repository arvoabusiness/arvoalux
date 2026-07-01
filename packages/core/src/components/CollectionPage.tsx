import type { Brand } from "../types";
import {
  storefront,
  COLLECTION_PRODUCTS_QUERY,
  ALL_PRODUCTS_QUERY,
  cacheTags,
  type ProductCard as ProductCardData,
} from "../shopify";
import { ProductGrid } from "./product/ProductGrid";

type CollectionResult = {
  collection: { title: string; description: string; products: { nodes: ProductCardData[] } } | null;
};

export async function CollectionPage({ brand, handle }: { brand: Brand; handle: string }) {
  let title = "Termékek";
  let description = "";
  let products: ProductCardData[] = [];
  try {
    const data = await storefront<CollectionResult>(
      brand.handle,
      COLLECTION_PRODUCTS_QUERY,
      { handle, first: 48 },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    if (data.collection) {
      title = data.collection.title;
      description = data.collection.description;
      products = data.collection.products.nodes;
    } else if (handle === brand.collectionHandle) {
      // The brand's canonical "all products" collection (`brand-<handle>`) is a
      // multi-brand-store concept that a single-brand real store won't have.
      // Fall back to every product so the "see all products" link still works.
      const all = await storefront<{ products: { nodes: ProductCardData[] } }>(
        brand.handle,
        ALL_PRODUCTS_QUERY,
        { first: 48 },
        { tags: [cacheTags.brand(brand.handle)] }
      );
      products = all.products.nodes;
    }
  } catch {
    products = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900 mb-2">{title}</h1>
      {description && <p className="text-gray-500 mb-8 max-w-2xl">{description}</p>}
      <div className="mt-6">
        <ProductGrid products={products} brandHandle={brand.handle} />
      </div>
    </div>
  );
}
