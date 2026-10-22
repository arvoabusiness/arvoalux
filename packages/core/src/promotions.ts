import "server-only";
import {storefront,cacheTags} from "./shopify";
import {SALE_PRODUCTS_QUERY,SALE_VARIANTS_QUERY} from "./promotions-query";
import {discountedVariant} from "./promotions-filter.mjs";
import type {ProductCard,Money} from "./catalog";
export type SaleVariant={id:string;title:string;availableForSale:boolean;price:Money;compareAtPrice:Money|null};
type Connection<T>={nodes:T[];pageInfo:{hasNextPage:boolean;endCursor:string|null}};
type SaleProduct=Omit<ProductCard,"priceRange"|"compareAtPriceRange"|"variants">&{variants:Connection<SaleVariant>};
const LUX_HERO_IDS = ["gid://shopify/Product/15621211324799", "gid://shopify/Product/15621212275071", "gid://shopify/Product/15621211816319", "gid://shopify/Product/15621211390335", "gid://shopify/Product/15621212078463", "gid://shopify/Product/15621212307839", "gid://shopify/Product/15621212340607", "gid://shopify/Product/15621212569983", "gid://shopify/Product/15621209981311", "gid://shopify/Product/15621207654783", "gid://shopify/Product/15621213127039", "gid://shopify/Product/15621213192575", "gid://shopify/Product/15621213225343", "gid://shopify/Product/15621213258111", "gid://shopify/Product/15621213290879", "gid://shopify/Product/15621213356415", "gid://shopify/Product/15621213389183", "gid://shopify/Product/15621218533759", "gid://shopify/Product/15621213913471", "gid://shopify/Product/15621213979007", "gid://shopify/Product/15621214011775", "gid://shopify/Product/15621214044543"];
export async function loadPromotions(brand:string){
 const products:ProductCard[]=[];let after:string|null=null;const cursors=new Set<string>();let scanned=0;
 for(;;){const data:{products:Connection<SaleProduct>}=await storefront<{products:Connection<SaleProduct>}>(brand,SALE_PRODUCTS_QUERY,{after},{revalidate:300,tags:[cacheTags.brand(brand)]});
  for(const p of data.products.nodes){scanned++;let variants=p.variants.nodes.slice(),info=p.variants.pageInfo;const seen=new Set<string>();
   while(info.hasNextPage){if(!info.endCursor||seen.has(info.endCursor))throw new Error("Invalid variant pagination");seen.add(info.endCursor);const more=await storefront<{product:{variants:Connection<SaleVariant>}|null}>(brand,SALE_VARIANTS_QUERY,{id:p.id,after:info.endCursor},{revalidate:300,tags:[cacheTags.brand(brand)]});if(!more.product)throw new Error("Unavailable product");variants.push(...more.product.variants.nodes);info=more.product.variants.pageInfo;}
   if(brand === "arvoalux" && LUX_HERO_IDS.includes(p.id)) {
    const heroVariant=variants.find(v=>Number.isFinite(Number(v.price.amount)) && Number(v.price.amount)>0);
    if(heroVariant && p.featuredImage) products.push({...p,priceRange:{minVariantPrice:heroVariant.price},compareAtPriceRange:null,variants:{nodes:[{id:heroVariant.id}]}});
    continue;
   }
   if(brand === "arvoalux") continue; // Owner-selected products only.
   const v=discountedVariant(variants);if(v&&p.availableForSale)products.push({...p,title:p.title+(v.title&&v.title!=="Default Title"?" — "+v.title:""),priceRange:{minVariantPrice:v.price},compareAtPriceRange:{minVariantPrice:v.compareAtPrice!},variants:{nodes:[{id:v.id}]}});
  }
  const info:Connection<SaleProduct>["pageInfo"]=data.products.pageInfo;if(!info.hasNextPage)break;if(!info.endCursor||cursors.has(info.endCursor))throw new Error("Invalid catalog pagination");cursors.add(info.endCursor);after=info.endCursor;
 }
 if(brand === "arvoalux") products.sort((a,b)=>{const ai=LUX_HERO_IDS.indexOf(a.id),bi=LUX_HERO_IDS.indexOf(b.id);return (ai<0?LUX_HERO_IDS.length:ai)-(bi<0?LUX_HERO_IDS.length:bi);});
 return {products,scanned};
}
