import type { Brand } from "../types";
import { storefront, PRODUCT_QUERY, formatPrice } from "../shopify";
import { addToCart } from "../cart";

type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
};
type Product = {
  id: string;
  title: string;
  descriptionHtml: string;
  tags: string[];
  featuredImage: { url: string; altText: string | null } | null;
  variants: { nodes: Variant[] };
};

export async function ProductPage({ brand, handle }: { brand: Brand; handle: string }) {
  const data = await storefront<{ product: Product | null }>(brand.handle, PRODUCT_QUERY, {
    handle,
  });
  const product = data.product;

  if (!product) {
    return (
      <main>
        <p className="empty">A termék nem található.</p>
      </main>
    );
  }

  const belongsToBrand = product.tags.includes(`brand:${brand.handle}`);

  return (
    <main>
      <div className="pdp">
        <div className="pdp-image">
          {product.featuredImage && (
            <img src={product.featuredImage.url} alt={product.featuredImage.altText ?? product.title} />
          )}
        </div>
        <div>
          <h1>{product.title}</h1>
          {!belongsToBrand && (
            <p className="empty">
              Figyelem: ez a termék nincs a(z) {brand.name} márkához rendelve.
            </p>
          )}
          <div className="desc" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          {product.variants.nodes.map((v) => (
            <form key={v.id} action={addToCart} className="variant-row">
              <input type="hidden" name="variantId" value={v.id} />
              <input type="hidden" name="brand" value={brand.handle} />
              <span>
                {v.title !== "Default Title" ? `${v.title} — ` : ""}
                <span className="price">{formatPrice(v.price.amount, v.price.currencyCode)}</span>
              </span>
              <button className="btn" type="submit" disabled={!v.availableForSale}>
                {v.availableForSale ? "Kosárba" : "Elfogyott"}
              </button>
            </form>
          ))}
        </div>
      </div>
    </main>
  );
}
