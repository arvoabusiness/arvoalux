import { Check } from "lucide-react";
import type { Brand } from "../types";
import {
  storefront,
  BRAND_PRODUCTS_QUERY,
  cacheTags,
  sellable,
  type ProductCard as ProductCardData,
} from "../shopify";
import { ProductCard } from "./product/ProductCard";

type HealthGoalPageProps = {
  brand: Brand;
  title: string; // e.g. "Immunerősítés"
  intro: string; // 2-3 sentence description
  benefits: string[]; // 3-4 bullet points
  collectionHandle: string; // Shopify collection to pull products from
};

/**
 * Reusable template for health-goal collection pages. All copy is prop-driven so
 * the same layout renders for every goal; only the products come from Shopify
 * (the collection named by `collectionHandle`).
 */
export async function HealthGoalPage({
  brand,
  title,
  intro,
  benefits,
  collectionHandle,
}: HealthGoalPageProps) {
  let products: ProductCardData[] = [];
  let error: string | null = null;

  try {
    const data = await storefront<{ collection: { products: { nodes: ProductCardData[] } } | null }>(
      brand.handle,
      BRAND_PRODUCTS_QUERY,
      { collection: collectionHandle, first: 12 },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    products = sellable(data.collection?.products.nodes ?? []);
  } catch (e) {
    error = e instanceof Error ? e.message : "Storefront API request failed.";
  }

  return (
    <div data-testid="health-goal-page">
      {/* Hero — subtle accent background driven by the brand colour */}
      <section className="bg-brand-50 border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-gray-600 max-w-2xl leading-relaxed">{intro}</p>
        </div>
      </section>

      {/* Benefit list */}
      {benefits.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <ul className="grid gap-3 sm:grid-cols-2">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <Check className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Products from the goal's Shopify collection */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500">Nincs megjeleníthető termék.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} brandHandle={brand.handle} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
