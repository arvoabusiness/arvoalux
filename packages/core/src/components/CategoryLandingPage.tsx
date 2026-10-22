import 'server-only';
import {heroSelections} from '../heroSelections';
import {parseFilterState,filterProducts,sortProducts,filterHref,FACET_FIELDS,type Facets} from '../catalogFilters.mjs';
import {loadFilterMetadata,buildFilterData} from '../catalogFilterData';
import {notFound} from 'next/navigation';
import type {Brand} from '../types';
import {storefront,ARVOALUX_COLLECTION_PAGE_QUERY,ARVOALUX_ALL_PRODUCTS_PAGE_QUERY,loadCatalogCollections,cacheTags} from '../shopify';
import {sellable,type ProductCard} from '../catalog';
import {loadPromotions} from '../promotions';
import {categoryManifest} from '../categoryManifest';
import {CategoryLandingView,type CategoryChip} from './CategoryLandingView';
type Params=Record<string,string|string[]|undefined>;
type Connection={nodes:ProductCard[];pageInfo:{hasNextPage:boolean;endCursor:string|null}};
async function readProducts(brand:string,handle?:string):Promise<ProductCard[]> {
 const products:ProductCard[]=[];let after:string|null=null;const seen=new Set<string>();
 for(let step=0;step<100;step++){
  const data:{collection?:{products:Connection}|null;products?:Connection}=await storefront<{collection?:{products:Connection}|null;products?:Connection}>(brand,handle?ARVOALUX_COLLECTION_PAGE_QUERY:ARVOALUX_ALL_PRODUCTS_PAGE_QUERY,{handle,first:250,after},{tags:[cacheTags.brand(brand)],revalidate:300});
  const connection:Connection|null|undefined=handle?data.collection?.products:data.products;if(!connection)throw new Error('Collection unavailable');
  products.push(...connection.nodes);if(!connection.pageInfo.hasNextPage)return products;
  const cursor:string|null=connection.pageInfo.endCursor;if(!cursor||seen.has(cursor)||!connection.nodes.length)throw new Error('Invalid collection pagination');seen.add(cursor);after=cursor;
 }
 throw new Error('Catalog pagination limit');
}
async function readUnion(brand:string,handles:string[]):Promise<ProductCard[]> {
 const result=new Map<string,ProductCard>();
 for(let i=0;i<handles.length;i+=3){const parts=await Promise.all(handles.slice(i,i+3).map(h=>readProducts(brand,h)));for(const part of parts)for(const p of part)result.set(p.id,p);}
 return [...result.values()];
}
export async function CategoryLandingPage({brand,slug,handle,searchParams={}}:{brand:Brand;slug?:string;handle?:string;searchParams?:Params}){
 const selectionKey=brand.handle==='arvoalux'&&typeof searchParams.selection==='string'?searchParams.selection:undefined;
 const selection=selectionKey?heroSelections[selectionKey]:undefined;
 if(selectionKey&&(!selection||selection.handle!==handle||slug))notFound();
 const group=slug?categoryManifest.groups.find(g=>g.slug===slug):undefined;
 if(slug&&!group)notFound();
 const expected=handle?categoryManifest.collections.find(c=>c.handle===handle):undefined;
 const all=Boolean((handle===brand.collectionHandle&&!expected)||group?.mode==='all');
 const related=group??categoryManifest.groups.find(g=>g.mode==='group'&&g.handles.some(h=>h===handle));
 const theme=related?.image??(/bor|haj|szepseg|feny|hialuron|kollagen/.test(handle||'')?'skincare':/baba|gyerek/.test(handle||'')?'family':/kutya|kullancsriaszto/.test(handle||'')?'pets':/alvas|stressz|energia|memoria|emesztes|maj|sziv/.test(handle||'')?'wellness':'essentials');
 let title=group?.label??expected?.title??(all?'Termékek':'Kategória');let failed=false;let products:ProductCard[]=[];let chips:CategoryChip[]=[];
 let message=group?.mode==='inactive'?'Jelenleg nincs aktív hűségakció.':undefined;
 const base=slug?`/categories/${encodeURIComponent(slug)}`:`/collections/${encodeURIComponent(handle!)}`;
 let baseHref=base;
 const filterState=parseFilterState(searchParams);
 let filterData={attributes:{},facets:{category:[],age:[],skin:[],form:[],vegan:[],sensitivity:[],area:[],brand:[]} as Facets,priceMax:0};
 try {
  const collections=await loadCatalogCollections(brand.handle);
  const verified=(h:string)=>{const e=categoryManifest.collections.find(c=>c.handle===h),matches=collections.filter(c=>c.handle===h);return e&&matches.length===1&&matches[0].id===e.id&&matches[0].title===e.title;};
  const handles:string[]=group?[...group.handles]:handle&&expected?[handle]:[];
  if(handles.some(h=>!verified(h)))throw new Error('Category identity unavailable');
  if(handle&&!all&&!expected) {const actual=collections.find(c=>c.handle===handle);if(!actual)notFound();title=actual.title;handles.push(handle);}
  const chipHandles:string[]=related?[...related.handles].filter(h=>h!==handle&&verified(h)):[];
  chips=chipHandles.map(h=>({label:group?.children?.find(c=>c.slug===h)?.label??categoryManifest.collections.find(c=>c.handle===h)!.title,href:`/collections/${encodeURIComponent(h)}`}));
  if(group?.mode!=='inactive') { if(group?.membership==='snapshot-union'){const ids=new Set(group.productIds??[]);products=(await readProducts(brand.handle)).filter(p=>ids.has(p.id));}else {products=all?await readProducts(brand.handle):await readUnion(brand.handle,handles);if(group?.productIds?.length){const ids=new Set(group.productIds);const direct=(await readProducts(brand.handle)).filter(p=>ids.has(p.id));products=[...new Map([...products,...direct].map(p=>[p.id,p])).values()];}} }
  if(group?.membership==='snapshot-union')chips=(group.children??[]).filter(c=>c.productIds?.length).map(c=>({label:c.label,href:'/categories/'+encodeURIComponent(c.slug)}));
  if(group?.mode==='sale'){const ids=new Set(products.map(p=>p.id));products=(await loadPromotions(brand.handle)).products.filter(p=>ids.has(p.id));chips=chipHandles.map(h=>({label:group?.children?.find(c=>c.slug===h)?.label??categoryManifest.collections.find(c=>c.handle===h)!.title,href:base+'?subcategory='+encodeURIComponent(h)}));}
  const sub=typeof searchParams.subcategory==='string'?searchParams.subcategory:undefined;
  if(sub&&group){if(!chipHandles.includes(sub))notFound();const ids=new Set((await readProducts(brand.handle,sub)).map(p=>p.id));products=products.filter(p=>ids.has(p.id));baseHref=base+'?subcategory='+encodeURIComponent(sub);title=categoryManifest.collections.find(c=>c.handle===sub)!.title;}
  if(group?.mode==='all'){
   const vendors=[...new Set(products.map(p=>p.vendor).filter((v):v is string=>Boolean(v)))].sort((a,b)=>a.localeCompare(b,'hu'));
   chips=vendors.map(v=>({label:v,href:base+'?vendor='+encodeURIComponent(v)}));
   if(typeof searchParams.vendor==='string'){if(!vendors.includes(searchParams.vendor))notFound();products=products.filter(p=>p.vendor===searchParams.vendor);title=searchParams.vendor;baseHref=base+'?vendor='+encodeURIComponent(searchParams.vendor);}
  }
  if(selection&&selectionKey){
   const allowed=new Set(selection.handles);products=products.filter(p=>allowed.has(p.handle));
   title=selection.title;message=selection.message;baseHref=base+'?selection='+encodeURIComponent(selectionKey);
   chips=selection.handle==='izulet-porc'?[
    {label:'Ízületi és porcformulák',href:base+'?selection=autumn-joints'},
    {label:'Csontozat és D-vitamin',href:base+'?selection=autumn-bones'}
   ]:[];
  }
  products=sellable(products);
  const metadata=await loadFilterMetadata(brand.handle);filterData=buildFilterData(products,metadata,filterState);
  products=sortProducts(filterProducts(products,filterData.attributes,filterState),filterState.sort);
 }catch(error){if(error instanceof Error&&error.message.startsWith('NEXT_HTTP_ERROR_FALLBACK'))throw error;failed=true;products=[];chips=[];}
 const pages=Math.max(1,Math.ceil(products.length/filterState.limit));const raw=typeof searchParams.page==='string'?searchParams.page:'1';const page=/^[1-9]\d{0,5}$/.test(raw)?Math.min(Number(raw),pages):1;
 return <CategoryLandingView key={filterHref(baseHref,filterState)} title={title} image={`/category-banners/${theme}.png`} imageAlt={categoryManifest.imageAlts[theme]} chips={chips} products={products.slice((page-1)*filterState.limit,page*filterState.limit)} total={failed?null:products.length} brandHandle={brand.handle} failed={failed} page={page} pages={pages} baseHref={filterHref(baseHref,filterState)} filterBase={baseHref} filterState={filterState} facets={filterData.facets} priceMax={filterData.priceMax} message={message}/>;
}
