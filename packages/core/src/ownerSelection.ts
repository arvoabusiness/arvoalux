import slots from "./ownerSelectionSlots.json";
export const selectionSlots = slots;
export const selectionQuery = `query OwnerSelection($handle: String!) { product(handle:$handle) { id handle title vendor availableForSale featuredImage { url altText } variants(first:100) { nodes { id availableForSale price { amount currencyCode } } pageInfo { hasNextPage } } } }`;
type Price = { amount: string; currencyCode: string };
type Product = { id: string; handle: string; title: string; vendor: string; availableForSale: boolean; featuredImage: {url:string;altText?:string|null}|null; variants: {nodes:{id:string;availableForSale:boolean;price:Price}[];pageInfo:{hasNextPage:boolean}} };
export type SelectionProduct = { id:string; handle:string; title:string; vendor:string; image:{url:string;altText?:string|null};price:Price;variantId:string };
export async function resolveOwnerSelection(request:(query:string,variables:{handle:string})=>Promise<{product:Product|null}>):Promise<SelectionProduct[]> {
 const rows:SelectionProduct[]=[];
 for (const slot of selectionSlots) {
  try {
   const {product:p}=await request(selectionQuery,{handle:slot.handle});
   if(!p || p.id!==slot.productId || p.handle!==slot.handle || !p.availableForSale || !p.title || !p.featuredImage?.url || p.variants.pageInfo.hasNextPage!==false) continue;
   const v=p.variants.nodes.find(v=>v.id===slot.variantId);
   if(!v?.availableForSale || v.price.currencyCode!=="HUF" || !Number.isFinite(Number(v.price.amount)) || Number(v.price.amount)<=0) continue;
   rows.push({id:p.id,handle:p.handle,title:p.title,vendor:p.vendor,image:p.featuredImage,price:v.price,variantId:v.id});
  } catch { /* A failed slot is hidden, never substituted. */ }
 }
 return rows;
}
