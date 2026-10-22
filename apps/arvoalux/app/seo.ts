import "server-only";
import { cache } from "react";
import { storefront, PRODUCT_QUERY, ARVOALUX_ALL_PRODUCTS_PAGE_QUERY } from "../../../packages/core/src/shopify";
export const origin = "https://www.arvoalux.hu";
export type SeoProduct = { title: string; vendor: string|null; descriptionHtml: string; featuredImage: {url:string;altText:string|null}|null; priceRange:{minVariantPrice:{amount:string;currencyCode:string}} };
export const loadSeoProduct = cache(async (handle:string) => (await storefront<{product:SeoProduct|null}>("arvoalux", PRODUCT_QUERY, {handle})).product);
export function plainDescription(html:string) { return html.replace(/<[^>]*>/g," ").replace(/&nbsp;|&#160;/g," ").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim().slice(0,160); }
export async function productUrls():Promise<string[]> {
  let after:string|null=null;const seen=new Set<string>();const urls=new Set<string>();
  for(let page=0;page<100;page++) {
    const data: {products:{nodes:{handle:string;title:string;priceRange:{minVariantPrice:{amount:string}}}[];pageInfo:{hasNextPage:boolean;endCursor:string|null}}} = await storefront("arvoalux",ARVOALUX_ALL_PRODUCTS_PAGE_QUERY,{first:250,after});
    for(const p of data.products.nodes) if(p.title.trim() && Number(p.priceRange.minVariantPrice.amount)>0 && /^[a-zA-Z0-9_-]+$/.test(p.handle)) urls.add(origin+"/products/"+p.handle);
    if(!data.products.pageInfo.hasNextPage) { if(!urls.size) throw new Error("Empty catalog sitemap refused"); return [...urls].sort(); }
    const cursor=data.products.pageInfo.endCursor;
    if(!cursor || seen.has(cursor)) throw new Error("Incomplete catalog pagination");
    seen.add(cursor);after=cursor;
  }
  throw new Error("Catalog pagination limit exceeded");
}
