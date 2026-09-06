import Link from "next/link";
import type { Brand } from "../../types";
import {
  ALL_PRODUCTS_QUERY,
  BRAND_PRODUCTS_QUERY,
  cacheTags,
  formatPrice,
  sellable,
  storefront,
  type ProductCard,
} from "../../shopify";

const HERO_PRODUCT_COUNT = 3;

type HeroConfig = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
};

/**
 * Evergreen, brand-owned copy only. Campaign claims, coupon codes and invented
 * merchandising data do not belong here: campaign UI must be fed by an approved
 * Shopify-backed campaign source before it can be rendered.
 */
function heroConfig(brand: Brand): HeroConfig {
  const approvedTagline = brand.tagline.trim();
  return {
    eyebrow: brand.name,
    title: approvedTagline && !approvedTagline.toLowerCase().startsWith("todo:")
      ? approvedTagline
      : "Válogass tudatosan a kínálatunkból.",
    description: "Fedezd fel a kínálatot, és válassz a jelenleg elérhető termékek közül.",
    cta: "Termékek megtekintése",
    href: `/collections/${brand.collectionHandle}`,
  };
}

async function heroProducts(brand: Brand): Promise<ProductCard[]> {
  try {
    const collectionData = await storefront<{
      collection: { products: { nodes: ProductCard[] } } | null;
    }>(
      brand.handle,
      BRAND_PRODUCTS_QUERY,
      { collection: brand.collectionHandle, first: HERO_PRODUCT_COUNT },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    const collectionProducts = sellable(collectionData.collection?.products.nodes ?? []);
    if (collectionProducts.length > 0) return collectionProducts.slice(0, HERO_PRODUCT_COUNT);

    // Some stores do not yet have their automated brand collection. The fallback
    // remains Shopify-backed and never manufactures a title, image or price.
    const allData = await storefront<{ products: { nodes: ProductCard[] } }>(
      brand.handle,
      ALL_PRODUCTS_QUERY,
      { first: HERO_PRODUCT_COUNT },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    return sellable(allData.products.nodes).slice(0, HERO_PRODUCT_COUNT);
  } catch {
    // The evergreen brand panel is safe to render when Shopify is unavailable.
    return [];
  }
}

const Arrow = () => (
  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export async function HeroBanner({ brand }: { brand: Brand }) {
  const config = heroConfig(brand);
  const products = await heroProducts(brand);
  const featured = products[0];
  const secondary = products.slice(1);

  return (
    <section className="bg-[var(--brand-bg)] py-5 md:py-8" data-testid="hero-banner" aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 lg:grid-cols-12">
        <div className="relative flex min-h-[320px] flex-col justify-center overflow-hidden rounded-[var(--brand-radius)] bg-brand p-7 text-brand-fg md:min-h-[420px] md:p-12 lg:col-span-7">
          <div className="relative z-10 max-w-xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] opacity-80">{config.eyebrow}</p>
            <h1 id="hero-title" className="font-heading text-4xl font-black leading-tight md:text-6xl">
              {config.title}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed opacity-90 md:text-lg">{config.description}</p>
            <Link
              href={config.href}
              className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 py-3 font-bold text-gray-900 shadow-sm outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
            >
              {config.cta}<Arrow />
            </Link>
          </div>
          <div aria-hidden="true" className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-white/10" />
          <div aria-hidden="true" className="absolute -right-8 top-8 h-36 w-36 rounded-full border border-white/20" />
        </div>

        {featured ? (
          <Link
            href={`/products/${featured.handle}`}
            className="group relative min-h-[320px] overflow-hidden rounded-[var(--brand-radius)] bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand lg:col-span-5 lg:min-h-[420px]"
            aria-label={`${featured.title} – ${formatPrice(featured.priceRange.minVariantPrice.amount, featured.priceRange.minVariantPrice.currencyCode)}`}
          >
            {featured.featuredImage ? (
              // Shopify CDN image: product-owned source, not placeholder content.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.featuredImage.url}
                alt={featured.featuredImage.altText ?? featured.title}
                width={800}
                height={800}
                fetchPriority="high"
                decoding="async"
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
              <p className="text-sm font-medium opacity-85">{featured.vendor}</p>
              <h2 className="mt-1 font-heading text-2xl font-bold leading-tight md:text-3xl">{featured.title}</h2>
              <p className="mt-3 text-xl font-bold">
                {formatPrice(featured.priceRange.minVariantPrice.amount, featured.priceRange.minVariantPrice.currencyCode)}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex min-h-[220px] items-center rounded-[var(--brand-radius)] border border-black/10 bg-white p-8 lg:col-span-5 lg:min-h-[420px]">
            <div>
              <h2 className="font-heading text-2xl font-bold text-gray-900">{brand.name}</h2>
              <p className="mt-2 text-gray-600">A termékkínálat betöltése folyamatban van.</p>
            </div>
          </div>
        )}

        {secondary.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className="group flex min-h-[140px] items-center gap-4 rounded-[var(--brand-radius)] bg-white p-4 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand lg:col-span-6"
          >
            {product.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.featuredImage.url}
                alt={product.featuredImage.altText ?? product.title}
                width={160}
                height={160}
                loading="lazy"
                decoding="async"
                className="h-28 w-28 flex-none rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : null}
            <div className="min-w-0">
              {product.vendor ? <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{product.vendor}</p> : null}
              <h2 className="mt-1 line-clamp-2 font-heading text-lg font-bold text-gray-900">{product.title}</h2>
              <p className="mt-2 font-bold text-brand">
                {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
