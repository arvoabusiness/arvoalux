import {luxBackorderIds,luxDelivery,huDate} from "../luxDelivery";
import homedicalProducts from "../homedical-products.json";
import Link from "next/link";
import { Home, ChevronRight, Truck, CircleCheck } from "lucide-react";
import type { Brand } from "../types";
import { storefront, PRODUCT_QUERY, cacheTags, formatPrice, type Money } from "../shopify";
import { ProductGallery } from "./product/ProductGallery";
import { AddToCartForm } from "./product/AddToCartForm";
import {ProductDetailsTabs} from "./product/ProductDetailsTabs";
import {PRODUCT_PRESENTATION_QUERY,productLeaflets,type ProductPresentation} from "../productPresentationData";
import { minimizeDescriptionMedia } from "../descriptionPrivacy";

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

  // Treat not-ready products (no valid price, e.g. the pulled SAA & CRP test) as
  // not found, so their direct product URL 404s too — matching the grids/search.
  if (!product || Number(product.priceRange.minVariantPrice.amount) <= 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Termék nem található</h2>
        <Link href="/" className="inline-flex bg-brand hover:bg-brand-dark text-brand-fg font-semibold px-5 py-3 rounded-xl transition-colors">
          Vissza a főoldalra
        </Link>
      </div>
    );
  }

  const homedical=brand.handle==="arvoalux"?(homedicalProducts as Record<string,{warranty:string}>)[product.id]:undefined;
  const delivery=brand.handle==="arvoalux"?luxDelivery(new Date(),homedical?5:3,homedical?7:5):null;
  const images = product.images.nodes.length ? product.images.nodes : product.featuredImage ? [product.featuredImage] : [];
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const onSale = compareAt && Number(compareAt.amount) > Number(price.amount);
  const discount = onSale ? Math.round(((Number(compareAt!.amount) - Number(price.amount)) / Number(compareAt!.amount)) * 100) : null;

  let presentation:ProductPresentation|null=null;
  try {presentation=(await storefront<{product:ProductPresentation|null}>(brand.handle,PRODUCT_PRESENTATION_QUERY,{handle},{tags:[cacheTags.product(handle)]})).product;}catch{}
  const variant=presentation?.variants.nodes.find(v=>v.id===product.variants.nodes[0]?.id);
  const description=minimizeDescriptionMedia(product.descriptionHtml);
  const details=[{label:'Megnevezés',value:product.title},...(homedical?[...(homedical.warranty?[{label:'Jótállás',value:homedical.warranty}]:[]),{label:'Várható kézbesítés',value:'5–7 munkanap'}]:[]),...(product.vendor?[{label:'Gyártó',value:product.vendor}]:[]),...(variant?.sku?[{label:'Cikkszám',value:variant.sku}]:[]),...(variant?.barcode?[{label:'Vonalkód',value:variant.barcode}]:[]),...(presentation?.productType?[{label:'Típus',value:presentation.productType}]:[]),...(variant?.title&&variant.title!=='Default Title'?[{label:'Kiszerelés',value:variant.title}]:[])];
  return (
    <div className="bg-white" data-testid="product-detail-page">
      <style>{`[data-testid="product-detail-page"] .product-gallery > div:first-child { aspect-ratio:1;max-height:560px;border-radius:8px; } [data-testid="product-detail-page"] .product-gallery > div:first-child img { padding:24px; } .product-delivery-benefits { margin:24px 0;background:var(--panel,#eaf2ed);border-radius:8px;padding:18px;display:grid;grid-template-columns:1fr 1fr;gap:18px;font-size:14px;line-height:1.5; } .product-delivery-benefits > div { display:flex;gap:10px;align-items:flex-start; } .product-delivery-benefits svg { color:var(--accent,var(--primary));flex-shrink:0;width:20px;height:20px; } .product-delivery-benefits > div:last-child { grid-column:1/-1; } .product-details-tabs { margin-top:48px; } .product-tab-list { display:flex;gap:28px;border-bottom:1px solid #e5e7eb;overflow-x:auto; } .product-tab-list button { padding:16px 0;min-height:52px;background:transparent;border:0;border-bottom:4px solid transparent;white-space:nowrap;font-size:16px;color:#737373; } .product-tab-list button[aria-selected="true"] { color:#171717;font-weight:700;border-bottom-color:var(--accent,var(--primary)); } .product-tab-panel { padding:32px 0;line-height:1.7;color:#525252; } .product-tab-panel[hidden] { display:none; } .product-data-table { max-width:850px; } .product-data-table > div { display:grid;grid-template-columns:180px 1fr;gap:16px;padding:14px 16px;border-bottom:1px solid #eee; } .product-data-table > div:nth-child(odd) { background:#f8f8f8; } .product-data-table dt { font-weight:700; } .product-data-table dd { margin:0;overflow-wrap:anywhere; } .product-tab-list button:focus-visible,.product-tab-panel:focus-visible { outline:2px solid var(--accent,var(--primary));outline-offset:3px; } @media(max-width:639px){.product-delivery-benefits{grid-template-columns:1fr;}.product-tab-list{gap:22px;}.product-tab-list button{font-size:14px;}.product-data-table > div{grid-template-columns:100px 1fr;font-size:14px;}}`}</style>
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
            {variant?.sku&&<p className="text-sm text-gray-400 mb-2" data-testid="product-sku">Cikkszám: {variant.sku}</p>}
            {product.vendor && product.vendor.toLowerCase() !== brand.name.toLowerCase() && (
              <p className="vendor">Gyártó: {product.vendor}</p>
            )}

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-extrabold text-brand" data-testid="product-price">{formatPrice(price.amount, price.currencyCode)}</span>
              {onSale && <span className="text-lg text-gray-400 line-through">{formatPrice(compareAt!.amount, compareAt!.currencyCode)}</span>}
              {discount && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-md">-{discount}%</span>}
            </div>

            {delivery && product.availableForSale && (luxBackorderIds.has(product.id)||Boolean(homedical)) && <p data-testid="procurement-time" className="text-sm font-semibold mb-3">Rendelhető, utánrendeléssel. {!homedical && <>Rendelés esetén várható feladás: <time dateTime={delivery.dispatch}>{huDate(delivery.dispatch)}</time> </>}Várható kézbesítés: <time dateTime={delivery.deliveryEarliest}>{huDate(delivery.deliveryEarliest)}</time> – <time dateTime={delivery.deliveryLatest}>{huDate(delivery.deliveryLatest)}</time> ({homedical?"5–7":"3–5"} munkanap).</p>}
            <AddToCartForm brandHandle={brand.handle} variants={product.variants.nodes} available={product.availableForSale} />

            <div className="product-delivery-benefits" data-testid="product-delivery-benefits"><div><CircleCheck/><span>Ingyenes szállítás 19 990 Ft felett</span></div><div><Truck/><span>{brand.handle === "arvoalux" ? homedical?"Várható kézbesítés: a rendeléstől számított 5–7 munkanap":"Várható kézbesítés: a rendeléstől számított 3–5 munkanap" : "Kézbesítés: saját raktárból 1–3, külső raktárból 5–7 munkanap"}</span></div></div>

            {product.tags.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex flex-wrap gap-2">
                  {product.tags
                    .filter((t) => !t.startsWith("brand:") && !t.startsWith("arvoa-") && !/^(?:homedical-import-|review:|scope:|supplier:)/.test(t))
                    .map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
              </div>
            )}
          </div>


        </div>
        <ProductDetailsTabs descriptionHtml={description} details={details} leaflets={productLeaflets(description)}/>
      </div>
    </div>
  );
}
