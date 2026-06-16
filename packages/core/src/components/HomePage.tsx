import type { Brand } from "../types";
import {
  storefront,
  BRAND_PRODUCTS_QUERY,
  formatPrice,
  type ProductCard,
} from "../shopify";

export async function HomePage({ brand }: { brand: Brand }) {
  let products: ProductCard[] = [];
  let error: string | null = null;

  try {
    const data = await storefront<{
      collection: { products: { nodes: ProductCard[] } } | null;
    }>(brand.handle, BRAND_PRODUCTS_QUERY, { collection: brand.collectionHandle });
    products = data.collection?.products.nodes ?? [];
    if (!data.collection) {
      error = `Collection "${brand.collectionHandle}" not found in Shopify.`;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Storefront API request failed.";
  }

  return (
    <main>
      <section className="hero">
        <h1>{brand.tagline}</h1>
        <p>{brand.name} — a központi Shopify platformon, saját arculattal.</p>
      </section>

      <h2 className="section-title">Kiemelt termékek</h2>

      {error ? (
        <p className="empty">{error}</p>
      ) : products.length === 0 ? (
        <p className="empty">
          Nincs még termék. Tag-eld a termékeket: <code>brand:{brand.handle}</code>
        </p>
      ) : (
        <div className="grid">
          {products.map((p, i) => (
            <a
              key={p.id}
              href={`/products/${p.handle}`}
              className="card"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {p.featuredImage ? (
                <img src={p.featuredImage.url} alt={p.featuredImage.altText ?? p.title} />
              ) : (
                <div className="ph" />
              )}
              <div className="card-body">
                <h3>{p.title}</h3>
                <span className="price">
                  {formatPrice(
                    p.priceRange.minVariantPrice.amount,
                    p.priceRange.minVariantPrice.currencyCode
                  )}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
