import 'server-only';
import {storefront,cacheTags} from './shopify';
import {FILTER_PRODUCTS_QUERY,FILTER_MEMBERSHIPS_QUERY} from './catalog-filter-query';
import {FACET_FIELDS,productFacets,filterProducts,type FilterMetadata,type FilterAttributes,type FilterState,type Facets,type FacetOption} from './catalogFilters.mjs';
import type {ProductCard} from './catalog';
type Connection<T>={nodes:T[];pageInfo:{hasNextPage:boolean;endCursor:string|null}};
export async function loadFilterMetadata(brand:string){
 const result:Record<string,FilterMetadata>={};let after:string|null=null;const seen=new Set<string>();
 for(let step=0;step<100;step++){
  const data:{products:Connection<FilterMetadata>}=await storefront<{products:Connection<FilterMetadata>}>(brand,FILTER_PRODUCTS_QUERY,{after},{tags:[cacheTags.brand(brand)]});
  for(const p of data.products.nodes){const nodes=p.collections.nodes.slice();let info=p.collections.pageInfo;const cursors=new Set<string>();
   while(info.hasNextPage){if(!info.endCursor||cursors.has(info.endCursor))throw new Error('Invalid membership pagination');cursors.add(info.endCursor);const more=await storefront<{product:{collections:FilterMetadata['collections']}|null}>(brand,FILTER_MEMBERSHIPS_QUERY,{id:p.id,after:info.endCursor},{tags:[cacheTags.brand(brand)]});if(!more.product)throw new Error('Unavailable product memberships');nodes.push(...more.product.collections.nodes);info=more.product.collections.pageInfo;}
   result[p.id]={...p,collections:{nodes,pageInfo:info}};
  }
  const cursor:string|null=data.products.pageInfo.endCursor;if(!data.products.pageInfo.hasNextPage)return result;if(!cursor||seen.has(cursor)||!data.products.nodes.length)throw new Error('Invalid filter metadata pagination');seen.add(cursor);after=cursor;
 }
 throw new Error('Filter metadata pagination limit');
}
export function buildFilterData(products:ProductCard[],metadata:Record<string,FilterMetadata>,state:FilterState){
 const attributes:FilterAttributes={};const labels=new Map<string,string>();for(const p of products){attributes[p.id]=productFacets(p,metadata[p.id]);for(const c of metadata[p.id]?.collections.nodes??[])labels.set(c.handle,c.title);}
 const facets={} as Facets;
 for(const field of FACET_FIELDS){const count=new Map<string,number>();const all=new Set<string>();for(const p of products)for(const v of attributes[p.id][field])all.add(v);for(const p of filterProducts(products,attributes,state,field))for(const v of new Set(attributes[p.id][field]))count.set(v,(count.get(v)??0)+1);
  const options:FacetOption[]=[...all].map(v=>({value:v,label:field==='category'||field==='area'?labels.get(v)??v:v,count:count.get(v)??0}));facets[field]=options.sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'hu'));
 }
 const amounts=products.map(p=>Number(p.priceRange.minVariantPrice.amount)).filter(Number.isFinite);const priceMax=amounts.length?Math.ceil(Math.max(...amounts)/1000)*1000:0;
 return {attributes,facets,priceMax};
}
