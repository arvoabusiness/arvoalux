import {storefront} from "../../../../packages/core/src/shopify";
import scope from "./scope.json";
import {buildFeed,type Product,type Scope} from "./feed";
export const dynamic="force-dynamic";
export const maxDuration=60;
const QUERY="query MerchantFeedPage($after:String){products(first:100,after:$after){nodes{id handle title vendor description featuredImage{url} variants(first:100){nodes{id sku barcode availableForSale currentlyNotInStock price{amount currencyCode}} pageInfo{hasNextPage}}}pageInfo{hasNextPage endCursor}}}";
type Page={products:{nodes:Product[];pageInfo:{hasNextPage:boolean;endCursor:string|null}}};
export async function GET(){
 try{
  let after:string|null=null;const seen=new Set<string>();const products:Product[]=[];
  for(let page=0;page<12;page++){
   const data:Page=await storefront<Page>("arvoalux",QUERY,{after},{revalidate:60});
   products.push(...data.products.nodes);
   if(!data.products.pageInfo.hasNextPage){
    const result=buildFeed(products,scope as Scope);
    return new Response(result.xml,{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=60, s-maxage=60, stale-if-error=0","X-Content-Type-Options":"nosniff","X-Arvoa-Feed-Items":String(result.count),"X-Arvoa-Feed-Held":String(result.held),"X-Arvoa-Feed-Missing-Gtin":String(result.missingGtin)}});
   }
   const next=data.products.pageInfo.endCursor;
   if(!next||seen.has(next)||!data.products.nodes.length)throw new Error("Incomplete catalog");
   seen.add(next);after=next;
  }
  throw new Error("Catalog limit");
 }catch{return new Response("Product data temporarily unavailable",{status:503,headers:{"Cache-Control":"no-store","Content-Type":"text/plain; charset=utf-8"}});}
}
