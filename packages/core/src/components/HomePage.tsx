import Link from "next/link";
import type { Brand } from "../types";
import {
  storefront,
  ALL_PRODUCTS_QUERY,
  formatPrice,
  type ProductCard,
} from "../shopify";

export async function HomePage({ brand }: { brand: Brand }) {
  let products: ProductCard[] = [];
  let error: string | null = null;

  try {
    const data = await storefront(brand.handle, ALL_PRODUCTS_QUERY, { first: 24 });
    products = data.products?.nodes ?? [];
  } catch (e) {
    error = e instanceof Error ? e.message : "Storefront API request failed.";
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8" data-testid="home-page">
      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">{brand.tagline}</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">{brand.name} — a központi Shopify platformon, saját arculattal.</h1>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Termékek</h2>
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500">Nincs még termék.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 transition-all hover:-translate-y-1 hover:shadow-md"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="aspect-square bg-white p-4">
                  {product.featuredImage ? (
                    <img
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText ?? product.title}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400">
                      Nincs kép
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{product.title}</h3>
                  <p className="text-base font-bold text-brand">
                    {formatPrice(
                      product.priceRange.minVariantPrice.amount,
                      product.priceRange.minVariantPrice.currencyCode
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
