import Link from "next/link";
import { Home, ChevronRight, Truck, Shield, Check } from "lucide-react";
import type { Brand } from "../types";
import { storefront, PRODUCT_QUERY, cacheTags, formatPrice, type Money } from "../shopify";
import { ProductGallery } from "./product/ProductGallery";
import { AddToCartForm } from "./product/AddToCartForm";

type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
};
type Product = {
  id: string;
  title: string;
  vendor: string | null;
  descriptionHtml: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: { url: string; altText: string | null } | null;
  images: { nodes: { url: string; altText: string | null }[] };
  priceRange: { minVariantPrice: Money };
  compareAtPriceRange: { minVariantPrice: Money } | null;
  variants: { nodes: Variant[] };
};

export async function ProductPage({ brand, handle }: { brand: Brand; handle: string }) {
  const data = await storefront<{ product: Product | null }>(
    brand.handle,
    PRODUCT_QUERY,
    { handle },
    { tags: [cacheTags.brand(brand.handle), cacheTags.product(handle)] }
  );
  const product = data.product;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Termék nem található</h2>
        <Link href="/" className="inline-flex bg-brand hover:bg-brand-dark text-brand-fg font-semibold px-5 py-3 rounded-xl transition-colors">
          Vissza a főoldalra
        </Link>
      </div>
    );
  }

  const images = product.images.nodes.length ? product.images.nodes : product.featuredImage ? [product.featuredImage] : [];
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const onSale = compareAt && Number(compareAt.amount) > Number(price.amount);
  const discount = onSale ? Math.round(((Number(compareAt!.amount) - Number(price.amount)) / Number(compareAt!.amount)) * 100) : null;

  return (
    <div className="bg-white" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center text-sm text-gray-400 gap-1.5">
          <Link href="/" className="hover:text-gray-600"><Home className="w-4 h-4" /></Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/collections/${brand.collectionHandle}`} className="hover:text-gray-600">Termékek</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-600 truncate max-w-[200px]">{product.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <ProductGallery images={images} title={product.title} />

          <div className="max-w-[700px]">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1" data-testid="product-title">{product.title}</h1>
            {product.vendor && product.vendor.toLowerCase() !== brand.name.toLowerCase() && (
              <p className="vendor">Gyártó: {product.vendor}</p>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold text-brand" data-testid="product-price">{formatPrice(price.amount, price.currencyCode)}</span>
              {onSale && <span className="text-lg text-gray-400 line-through">{formatPrice(compareAt!.amount, compareAt!.currencyCode)}</span>}
              {discount && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md">-{discount}%</span>}
            </div>

            <AddToCartForm brandHandle={brand.handle} variants={product.variants.nodes} available={product.availableForSale} />

            <div className="flex flex-col gap-3 my-6">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Truck className="w-5 h-5 text-brand" /><span>Ingyenes szállítás 17 990 Ft felett</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Shield className="w-5 h-5 text-brand" /><span>Biztonságos fizetés</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="w-5 h-5 text-brand" /><span>Prémium minőség</span></div>
            </div>

            {product.tags.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  {product.tags
                    .filter((t) => !t.startsWith("brand:"))
                    .map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
              </div>
            )}
          </div>

          {product.descriptionHtml && (
            <div className="md:col-span-2 border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 mb-3">Leírás</h3>
              <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} data-testid="product-description" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
