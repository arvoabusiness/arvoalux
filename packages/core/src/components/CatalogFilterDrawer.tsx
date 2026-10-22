"use client";
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {XCircle,ChevronDown,Check} from 'lucide-react';
import {FACET_FIELDS,PAGE_SIZES,defaultFilterState,filterHref,type FilterState,type Facets,type FacetField} from '../catalogFilters.mjs';
import {catalogFilterStyles} from '../CatalogFilterStyles';
const sortLabels:Record<string,string>={default:'Alapértelmezett','name-asc':'Név A-Z','name-desc':'Név Z-A','price-asc':'Ár a legalacsonyabbtól','price-desc':'Ár a legmagasabbtól'};
const fieldLabels:Record<FacetField,string>={category:'Kategória',age:'Korcsoport',skin:'Bőrtípus',form:'Állag',vegan:'Vegán',sensitivity:'Érzékenység',area:'Alkalmazási terület',brand:'Márka'};
export function CatalogFilterDrawer({open,onClose,state,facets,priceMax,baseHref}:{open:boolean;onClose:()=>void;state:FilterState;facets:Facets;priceMax:number;baseHref:string}){
 const ref=useRef<HTMLDialogElement>(null),router=useRouter(),[draft,setDraft]=useState<FilterState>(state);
 useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(open){setDraft(state);if(!dialog.open)dialog.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;if(dialog.open)dialog.close();};}else if(dialog.open)dialog.close();},[open,state]);
 const min=draft.min===''?0:Number(draft.min),max=draft.max===''?priceMax:Number(draft.max);
 const toggle=(f:FacetField,v:string)=>setDraft(s=>({...s,[f]:s[f].includes(v)?s[f].filter(x=>x!==v):[...s[f],v]}));
 const apply=(s:FilterState)=>{router.push(filterHref(baseHref,s));onClose();};
 const setPrice=(field:'min'|'max',value:string)=>{if(value!==''&&(!Number.isFinite(Number(value))||Number(value)<0))return;setDraft(s=>({...s,[field]:value}));};
 return <dialog ref={ref} className="catalog-filter-dialog" aria-labelledby="catalog-filter-title" data-testid="catalog-filter-dialog" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===ref.current)onClose();}}>
  <style>{catalogFilterStyles}</style>
  <form className="filter-shell" method="get" onSubmit={e=>{e.preventDefault();apply(draft);}}>
   <header className="filter-header"><h2 id="catalog-filter-title">Szűrők</h2><button type="button" className="filter-close" aria-label="Szűrők bezárása" onClick={onClose}><XCircle size={26}/></button></header>
   <div className="filter-scroll">
    <details className="filter-row filter-preference" data-field="sort"><summary><span>Rendezés</span><span className="filter-selected-label">{sortLabels[draft.sort]}</span><ChevronDown/></summary><div className="filter-options">{Object.entries(sortLabels).map(([v,label])=><label key={v} className="filter-option"><input type="radio" name="sort" value={v} checked={draft.sort===v} onChange={()=>setDraft(s=>({...s,sort:v}))}/><span>{label}</span><Check className="filter-check"/></label>)}</div></details>
    <details className="filter-row filter-preference" data-field="limit"><summary><span>Termékek száma</span><span className="filter-selected-label">{draft.limit}</span><ChevronDown/></summary><div className="filter-options">{PAGE_SIZES.map(v=><label key={v} className="filter-option"><input type="radio" name="limit" value={v} checked={draft.limit===v} onChange={()=>setDraft(s=>({...s,limit:v}))}/><span>{v}</span><Check className="filter-check"/></label>)}</div></details>
    <details className="filter-row" data-field="price"><summary><span>Ár</span><ChevronDown/></summary><div className="filter-price"><div className="filter-price-inputs"><label><input type="number" name="min" aria-label="Minimum ár" min={0} step="any" value={min} onChange={e=>setPrice('min',e.target.value)}/>Ft</label><label><input type="number" name="max" aria-label="Maximum ár" min={0} step="any" value={max} onChange={e=>setPrice('max',e.target.value)}/>Ft</label></div><div className="filter-range"><input type="range" aria-label="Minimális ár csúszka" min={0} max={priceMax||1} step={1} disabled={!priceMax} value={Math.min(min,priceMax)} onChange={e=>setPrice('min',String(Math.min(Number(e.target.value),max)))}/><input type="range" aria-label="Maximális ár csúszka" min={0} max={priceMax||1} step={1} disabled={!priceMax} value={Math.min(max,priceMax)} onChange={e=>setPrice('max',String(Math.max(Number(e.target.value),min)))}/></div></div></details>
    {FACET_FIELDS.map(field=><details key={field} className="filter-row" data-field={field}><summary><span>{fieldLabels[field]}</span><ChevronDown/></summary>{facets[field].length?<div className="filter-options">{facets[field].map(o=><label className="filter-option" key={o.value}><input type="checkbox" name={field} value={o.value} checked={draft[field].includes(o.value)} disabled={!o.count&&!draft[field].includes(o.value)} onChange={()=>toggle(field,o.value)}/><span>{o.label}</span><span className="filter-option-count">{o.count}</span></label>)}</div>:<p className="filter-empty">Nincs megadott termékadat.</p>}</details>)}
   </div>
   <footer className="filter-actions"><button type="button" onClick={()=>apply(defaultFilterState())}>Visszaállítás</button><button type="submit">Szűrés</button></footer>
  </form>
 </dialog>;
}
