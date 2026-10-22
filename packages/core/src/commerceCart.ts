import 'server-only';
import {homedicalVariantAllowed} from './homedicalVisibility';
import { cookies } from 'next/headers';
const fragment = `fragment CurrentCart on Cart { id updatedAt attributes { key value } checkoutUrl discountCodes { code applicable } totalQuantity cost { totalAmount { amount currencyCode } subtotalAmount { amount currencyCode } } lines(first:100) { nodes { id quantity cost { totalAmount { amount currencyCode } amountPerQuantity { amount currencyCode } compareAtAmountPerQuantity { amount currencyCode } } merchandise { ... on ProductVariant { id title availableForSale product { id title handle vendor } image { url altText } price { amount currencyCode } compareAtPrice { amount currencyCode } } } } pageInfo { hasNextPage } } }`;
const operations: Record<string,string> = {
 read:`query Cart($id:ID!) { cart(id:$id) { ...CurrentCart } }`,
 create:`mutation Create($lines:[CartLineInput!]!,$attributes:[AttributeInput!]!) { cartCreate(input:{lines:$lines,attributes:$attributes,buyerIdentity:{countryCode:HU}}) { cart { ...CurrentCart } userErrors { message } } }`,
 add:`mutation Add($id:ID!,$lines:[CartLineInput!]!) { cartLinesAdd(cartId:$id,lines:$lines) { cart { ...CurrentCart } userErrors { message } } }`,
 update:`mutation Update($id:ID!,$lines:[CartLineUpdateInput!]!) { cartLinesUpdate(cartId:$id,lines:$lines) { cart { ...CurrentCart } userErrors { message } } }`,
 discount:`mutation Discount($id:ID!,$codes:[String!]!) { cartDiscountCodesUpdate(cartId:$id,discountCodes:$codes) { cart { ...CurrentCart } userErrors { message } } }`,
 remove:`mutation Remove($id:ID!,$lineIds:[ID!]!) { cartLinesRemove(cartId:$id,lineIds:$lineIds) { cart { ...CurrentCart } userErrors { message } } }`,
};
async function request(op:string,variables:Record<string,unknown>) {
 const r=await fetch('https://arvoalux.myshopify.com/api/2026-07/graphql.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:operations[op]+'\n'+fragment,variables}),cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!r.ok) throw new Error('CART_UNAVAILABLE');
 const j=await r.json(); if(j.errors?.length)throw new Error('CART_UNAVAILABLE');
 if(op==='read'){ const cart=j.data.cart; if(cart && !cart.attributes.some((a:any)=>a.key==='arvoa_brand'&&a.value===process.env.STOREFRONT_APP_BRAND))throw new Error('CART_BRAND_INVALID'); return cart; }
 const result=j.data[({create:'cartCreate',add:'cartLinesAdd',update:'cartLinesUpdate',remove:'cartLinesRemove',discount:'cartDiscountCodesUpdate'} as Record<string,string>)[op]];
 if(result.userErrors?.length||!result.cart)throw new Error('CART_REJECTED');return result.cart;
}
function publicCart(cart:any) {
 if(!cart)return null;
 if(cart.lines.nodes.some((line:any)=>!homedicalVariantAllowed(process.env.STOREFRONT_APP_BRAND,line.merchandise.id)))throw new Error("CART_BRAND_INVALID");
 if(cart.lines.pageInfo.hasNextPage)throw new Error('CART_LIMIT');
 const url=new URL(cart.checkoutUrl);if(!['arvoalux.myshopify.com','x8rviz-vz.myshopify.com'].includes(url.hostname)||url.protocol!=='https:')throw new Error('CHECKOUT_INVALID');
 url.searchParams.set('locale','hu');
 return {...(process.env.STOREFRONT_APP_BRAND==='arvoalux'?{analytics:{id:cart.id.split('?')[0],updatedAt:cart.updatedAt,cost:cart.cost,lines:{nodes:cart.lines.nodes.map((line:any)=>({id:line.id,quantity:line.quantity,merchandise:{id:line.merchandise.id,title:line.merchandise.title,price:line.cost.amountPerQuantity,product:{id:line.merchandise.product.id,title:line.merchandise.product.title,vendor:line.merchandise.product.vendor}}}))}}}:{}),discountCodes:cart.discountCodes,totalQuantity:cart.totalQuantity,total:cart.cost.totalAmount,checkoutUrl:url.toString(),lines:cart.lines.nodes.map((line:any)=>({id:line.id,quantity:line.quantity,cost:line.cost,merchandise:line.merchandise}))};
}
export async function cartRoute(req:Request) {
 const headers={'Cache-Control':'no-store, private','Vary':'Cookie','X-Content-Type-Options':'nosniff'};
 const reply=(value:unknown,status=200)=>Response.json(value,{status,headers});
 if(process.env.NEXT_PUBLIC_ARVOA_COMMERCE!=='1')return reply({error:'A vásárlás nem elérhető.'},503);
 const brand=process.env.STOREFRONT_APP_BRAND;
 if(!brand||!['arvoalux','biobarat','boltbio','nagykervitamin','napivitamin','nutrimarket','prevenciobolt','provitaminok','vitaminbolt'].includes(brand))return reply({error:'A kosár nem elérhető.'},503);
 if(req.method==='POST'&&(req.headers.get('origin')!==new URL(req.url).origin||!req.headers.get('content-type')?.startsWith('application/json')||req.headers.has('next-action')))return reply({error:'Érvénytelen kérés.'},403);
 const jar=await cookies(), name='__Host-arvoa-cart-'+brand;const id=jar.get(name)?.value;
 try {
  if(req.method==='GET')return reply({cart:publicCart(id?await request('read',{id}):null)});
  if(Number(req.headers.get('content-length')||0)>4096)return reply({error:'Érvénytelen kérés.'},413);
  const body=await req.json();if(body.brand!==brand)return reply({error:'Érvénytelen kérés.'},400);
  const op=body.action;let cart:any;
  if(op==='add'){
   if(!homedicalVariantAllowed(brand,body.variantId))return reply({error:'A termék ebben a webáruházban nem rendelhető.'},400);
   if(!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(body.variantId)||!Number.isInteger(body.quantity)||body.quantity<1||body.quantity>99)return reply({error:'Érvénytelen mennyiség.'},400);
   const existing=id?await request('read',{id}):null;
   if(existing&&(existing.totalQuantity+body.quantity>500||existing.lines.nodes.length>=99&&!existing.lines.nodes.some((x:any)=>x.merchandise.id===body.variantId)))return reply({error:'A kosár megtelt.'},400);
   if(existing && existing.lines.nodes.some((x:any)=>x.merchandise.id===body.variantId && x.quantity+body.quantity>99))return reply({error:'Érvénytelen mennyiség.'},400);
   const lines=[{merchandiseId:body.variantId,quantity:body.quantity}];
   cart=await request(existing?'add':'create',existing?{id,lines}:{lines,attributes:[{key:'arvoa_brand',value:brand}]});
  }else if(op==='discount'){
   if(!id||!Array.isArray(body.codes)||body.codes.length>1||body.codes.some((x:unknown)=>typeof x!=='string'||!x.trim()||x.length>100||/[\r\n\u0000]/.test(x)))return reply({error:'Érvénytelen kuponkód.'},400);
   const current=await request('read',{id});if(!current?.totalQuantity)return reply({error:'A kosár üres.'},400);
   cart=await request('discount',{id,codes:body.codes.map((x:string)=>x.trim())});
  }else if(op==='update'||op==='remove'){
   if(!id)return reply({error:'A kosár üres.'},400);
   const current=await request('read',{id});if(!current?.lines.nodes.some((x:any)=>x.id===body.lineId))return reply({error:'A termék nem található.'},400);
   if(op==='update'&&(!Number.isInteger(body.quantity)||body.quantity<1||body.quantity>99))return reply({error:'Érvénytelen mennyiség.'},400);
   if(op==='update' && current.totalQuantity-current.lines.nodes.find((x:any)=>x.id===body.lineId).quantity+body.quantity>500)return reply({error:'A kosár megtelt.'},400);
   cart=await request(op,op==='remove'?{id,lineIds:[body.lineId]}:{id,lines:[{id:body.lineId,quantity:body.quantity}]});
  }else return reply({error:'Érvénytelen kérés.'},400);
  jar.set(name,cart.id,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:60*60*24*10});
  return reply({cart:publicCart(cart)});
 }catch{return reply({error:'A kosár nem frissült. Ellenőrizd a tartalmát, mielőtt újra próbálkozol.'},502);}
}
