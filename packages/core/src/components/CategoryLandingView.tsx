"use client";
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {filterHref} from '../catalogFilters.mjs';
import {ChevronDown,ChevronUp,SlidersHorizontal} from 'lucide-react';
import type {ProductCard} from '../catalog';
import {ProductGrid} from './product/ProductGrid';
import {CatalogFilterDrawer} from './CatalogFilterDrawer';
import type {FilterState,Facets} from '../catalogFilters.mjs';
import {categoryLandingStyles} from '../CategoryLandingStyles';
export type CategoryChip={label:string;href:string};
export function CategoryLandingView({title,image,imageAlt,chips,products,total,brandHandle,failed,page,pages,baseHref,message,filterBase,filterState,facets,priceMax}:{title:string;image:string;imageAlt:string;chips:CategoryChip[];products:ProductCard[];total:number|null;brandHandle:string;failed:boolean;page:number;pages:number;baseHref:string;message?:string;filterBase:string;filterState:FilterState;facets:Facets;priceMax:number}){
 const router=useRouter();
 const countLabel=total===null?'A termékszám nem elérhető':`${new Intl.NumberFormat('hu-HU').format(total)} tétel`;
 const changeToolbar=(field:'sort'|'limit',value:string)=>router.push(filterHref(filterBase,{...filterState,[field]:field==='limit'?Number(value):value}),{scroll:false});
 const [expanded,setExpanded]=useState(false);const [filterOpen,setFilterOpen]=useState(false);
 const pageHref=(p:number)=>{const q=new URLSearchParams(baseHref.split('?')[1]||'');if(p>1)q.set('page',String(p));else q.delete('page');return baseHref.split('?')[0]+(q.size?'?'+q:'');};
 return <section className="category-landing" data-testid="category-landing" data-category-total={total??'unavailable'} data-filter-sort={filterState.sort} data-filter-limit={filterState.limit}>
  <style>{categoryLandingStyles}</style>
  <CatalogFilterDrawer open={filterOpen} onClose={()=>setFilterOpen(false)} state={filterState} facets={facets} priceMax={priceMax} baseHref={filterBase}/>
  <div className="category-hero">
   <nav className="category-breadcrumb" aria-label="Morzsamenü"><Link href="/">Főoldal</Link><span aria-hidden="true">›</span><span>{title}</span></nav>
   <div className="category-heading"><h1 className="category-title">{title}</h1><span className="category-heading-count">{countLabel}</span></div>
  <img className="category-banner" src={image} alt={imageAlt} width={1942} height={809} fetchPriority="high" data-testid="category-banner"/>
  </div>
  <div className="category-content">
   <nav className="category-chips" aria-label="Alkategóriák" id="category-subcategories">{chips.map((c,index)=><Link prefetch={false} key={c.href} href={c.href} className={'category-chip'+(!expanded&&index>=4?' category-chip-extra':'')}>{c.label}</Link>)}</nav>
   {chips.length>4&&<div className="category-more-divider"><button type="button" className="category-more" aria-expanded={expanded} aria-controls="category-subcategories" onClick={()=>setExpanded(!expanded)}>{expanded?'Mutass kevesebbet':'Mutass többet'}{expanded?<ChevronUp size={20}/>:<ChevronDown size={20}/>}</button></div>}
   <div className="category-toolbar"><button type="button" className="category-filter" aria-label="Szűrők" onClick={()=>setFilterOpen(true)}><SlidersHorizontal size={22}/>Szűrők</button><p className="category-count" data-testid="category-count">{countLabel}</p><div className="category-desktop-controls"><select aria-label="Termékek rendezése" value={filterState.sort} onChange={e=>changeToolbar('sort',e.target.value)}><option value="default">Alapértelmezett</option><option value="name-asc">Név A-Z</option><option value="name-desc">Név Z-A</option><option value="price-asc">Ár a legalacsonyabbtól</option><option value="price-desc">Ár a legmagasabbtól</option></select><select aria-label="Termékek száma" value={filterState.limit} onChange={e=>changeToolbar('limit',e.target.value)}>{[24,36,48].map(size=><option key={size} value={size}>{size}</option>)}</select></div></div>
   {message&&<p className="category-message">{message}</p>}
   {failed?<p role="alert" className="category-message">A terméklista nem tölthető be. Kérjük, próbálja újra.</p>:<ProductGrid products={products} brandHandle={brandHandle}/>}
   {pages>1&&<nav aria-label="Terméklista lapozása" className="category-page-nav">{page>1&&<a href={pageHref(page-1)} rel="prev">Előző oldal</a>}<span>{page} / {pages}</span>{page<pages&&<a href={pageHref(page+1)} rel="next">Következő oldal</a>}</nav>}
   {failed&&<a href={baseHref}>Újrapróbálkozás</a>}
  </div>
 </section>;
}
