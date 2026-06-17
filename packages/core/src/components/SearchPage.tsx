import type { Brand } from "../types";
import {
  storefront,
  SEARCH_PRODUCTS_QUERY,
  cacheTags,
  type ProductCard as ProductCardData,
} from "../shopify";
import { ProductGrid } from "./product/ProductGrid";

export async function SearchPage({ brand, query }: { brand: Brand; query: string }) {
  const q = query.trim();
  let products: ProductCardData[] = [];

  if (q) {
    try {
      const data = await storefront<{ products: { nodes: ProductCardData[] } }>(
        brand.handle,
        SEARCH_PRODUCTS_QUERY,
        { query: q, first: 48 },
        { tags: [cacheTags.brand(brand.handle)] }
      );
      products = data.products.nodes;
    } catch {
      products = [];
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900 mb-2">
        {q ? `Találatok: „${q}”` : "Keresés"}
      </h1>
      <p className="text-gray-500 mb-8">
        {q ? `${products.length} termék` : "Írj be egy keresőkifejezést a fejlécben."}
      </p>
      {q && <ProductGrid products={products} brandHandle={brand.handle} />}
    </div>
  );
}
