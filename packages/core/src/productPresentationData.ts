import 'server-only';
export const PRODUCT_PRESENTATION_QUERY='query ProductPresentation($handle:String!){product(handle:$handle){productType variants(first:100){nodes{id sku barcode title}}}}';
export type ProductPresentation={productType:string;variants:{nodes:{id:string;sku:string|null;barcode:string|null;title:string}[]}};
export function productLeaflets(html:string){
 const result=new Map<string,{href:string;label:string}>();
 for(const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  const label=match[2].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();const normalized=label.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(!normalized.includes('betegtajekoztato'))continue;
  try{const url=new URL(match[1].replace(/&amp;/g,'&'));if(url.protocol==='https:'&&!url.username&&!url.password)result.set(url.href,{href:url.href,label:label||'Betegtájékoztató'});}catch{}
 }
 return [...result.values()];
}
