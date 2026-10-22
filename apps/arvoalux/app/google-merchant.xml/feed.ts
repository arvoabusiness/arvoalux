import {luxBackorderIds,luxDelivery} from "../../../../packages/core/src/luxDelivery";
import homedicalProducts from "../../../../packages/core/src/homedical-products.json";
const homedicalIds=new Set(Object.keys(homedicalProducts));
export type Variant = {id:string;sku:string|null;barcode:string|null;availableForSale:boolean;currentlyNotInStock:boolean;price:{amount:string;currencyCode:string}};
export type Product = {id:string;handle:string;title:string;vendor:string;description:string;featuredImage:{url:string}|null;variants:{nodes:Variant[];pageInfo:{hasNextPage:boolean}}};
export type Scope = Record<string,{brand:string;handle:string}>;
const xml = (value:string) => value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
export function validGtin(value:string):boolean {
 if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(value)) return false;
 const sum=value.slice(0,-1).split("").reverse().reduce((n,c,i)=>n+Number(c)*(i%2===0?3:1),0);
 return (10-sum%10)%10===Number(value.slice(-1));
}
export function buildFeed(products:Product[],scope:Scope,now=new Date()):{xml:string;count:number;held:number;missingGtin:number} {
 const delivery=luxDelivery(now);const items:string[]=[];const seen=new Set<string>();let held=0,missingGtin=0;
 for(const p of products){
  const authority=scope[p.id];if(!authority||authority.handle!==p.handle)continue;
  if(p.variants.pageInfo.hasNextPage)throw new Error("Incomplete variant pagination");
  for(const v of p.variants.nodes){
   const amount=v.price.amount;
   // Only the exact owner-approved 105 backorders have matching published dispatch estimates.
   if(!v.availableForSale||(v.currentlyNotInStock&&!luxBackorderIds.has(p.id)&&!homedicalIds.has(p.id))||!p.featuredImage||!p.description.trim()||!p.title.trim()||v.price.currencyCode!=="HUF"||!/^\d+(?:\.\d{1,2})?$/.test(amount)||Number(amount)<=0||!/^https:\/\/cdn\.shopify\.com\//.test(p.featuredImage.url)||!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(v.id)){held++;continue;}
   const itemDelivery=homedicalIds.has(p.id)?luxDelivery(now,5,7):delivery;
   const id="lux-"+v.id.split("/").pop();if(seen.has(id))throw new Error("Duplicate variant identity");seen.add(id);
   const tag=(key:string,value:string)=>`<g:${key}>${xml(value)}</g:${key}>`;
   const gtin=String(v.barcode||"").trim();if(!validGtin(gtin))missingGtin++;
   items.push("<item>"+tag("id",id)+tag("title",p.title.slice(0,150))+tag("description",p.description.replace(/\s+/g," ").trim().slice(0,5000))+tag("link","https://arvoalux.hu/products/"+p.handle+"?variant="+v.id.split("/").pop())+tag("image_link",p.featuredImage.url)+tag("price",amount+" HUF")+tag("availability",v.currentlyNotInStock?"backorder":"in_stock")+(v.currentlyNotInStock?tag("availability_date",itemDelivery.availabilityDate):"")+tag("condition","new")+tag("brand",authority.brand)+(validGtin(gtin)?tag("gtin",gtin):"")+(homedicalIds.has(p.id)?"<g:shipping>"+tag("country","HU")+tag("service","Homedical – kézbesítés 5–7 munkanap")+tag("price",(Number(amount)>=19990?"0":"1490")+" HUF")+"</g:shipping>":"")+tag("custom_label_0",authority.brand)+tag("custom_label_1",homedicalIds.has(p.id)?"homedical-approved-20261022":"supplier-approved-20261019")+(homedicalIds.has(p.id)?tag("excluded_destination","Shopping_ads"):"")+"</item>");
  }
 }
 if(!items.length)throw new Error("No eligible products; refusing empty replacement feed");
 return {xml:'<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>ArvoaLux aktuális termékkatalógus</title><link>https://arvoalux.hu</link><description>Aktuális webshopárak és elérhetőség</description>'+items.join("")+'</channel></rss>',count:items.length,held,missingGtin};
}
