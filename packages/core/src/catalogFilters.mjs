/** Pure catalog filtering. Unknown attributes never imply a negative claim. */
export const FACET_FIELDS = ['category','age','skin','form','vegan','sensitivity','area','brand'];
export const SORT_OPTIONS = ['default','name-asc','name-desc','price-asc','price-desc'];
export const PAGE_SIZES = [24,36,48];
export function defaultFilterState(){return {sort:'default',limit:24,min:'',max:'',category:[],age:[],skin:[],form:[],vegan:[],sensitivity:[],area:[],brand:[]};}
export function parseFilterState(params={}){
 const s=defaultFilterState();if(typeof params.sort==='string'&&SORT_OPTIONS.includes(params.sort))s.sort=params.sort;
 if(typeof params.limit==='string'&&PAGE_SIZES.includes(Number(params.limit)))s.limit=Number(params.limit);
 for(const f of ['min','max'])if(typeof params[f]==='string'&&/^\d{1,9}(?:\.\d{1,2})?$/.test(params[f]))s[f]=params[f];
 for(const f of FACET_FIELDS){const a=Array.isArray(params[f])?params[f]:typeof params[f]==='string'?[params[f]]:[];s[f]=[...new Set(a.filter(v=>typeof v==='string'&&v.length>0&&v.length<=200))].slice(0,150);}
 return s;
}
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const textFromHTML=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ');
const forms=[['lagyzselatin kapszula','lágyzselatin kapszula'],['szopogatos tabletta','szopogatós tabletta'],['ragotabletta','rágótabletta'],['pezsgotabletta','pezsgőtabletta'],['gumivitamin','gumivitamin'],['kapszula','kapszula'],['tabletta','tabletta'],['granulatum','granulátum'],['oldat','oldat'],['spray','spray'],['csepp','csepp'],['por','por'],['szirup','szirup'],['krem','krém'],['gel','gél']];
const areas=new Set(['immunerositok','izulet-porc','sziv-keringes','emesztes-belrendszer','alvas-stressz','energia-koncentracio','bor-haj-korom','maj-meregtelenitetes','nok-egeszsege','ferfi-egeszseg','gyerekeknek','szem-egeszseg','vercukorszint','errendszer-visszer']);
const freeClaims=[['cukor','cukormentes'],['laktoz','laktózmentes'],['alkohol','alkoholmentes'],['tartositoszer','tartósítószermentes'],['gluten','gluténmentes'],['gmo','GMO mentes'],['szoja','szójamentes']];
export function productFacets(p,metadata){
 const cols=metadata?.collections?.nodes??[],title=normalize(metadata?.title??p.title),text=normalize(textFromHTML(metadata?.descriptionHtml??''));
 const form=forms.find(([term])=>new RegExp('(?:^|[^a-z])'+term+'(?:$|[^a-z])').test(title));
 const negativeVegan=/\bnem\s+vegan\b/.test(text)||/\bnem\s+vegan\b/.test(title);
 const positiveTitle=/(?:^|[^a-z])(?:vegan|veganok)(?:$|[^a-z])/.test(title);
 const vegan=[];if(negativeVegan&&!positiveTitle)vegan.push('Nem');
 else if(!negativeVegan&&/(?:^|[^a-z])(?:vegan|veganok)(?:$|[^a-z])/.test(title))vegan.push('Igen');
 else if(!negativeVegan&&/\bvegan(?:ok\s+(?:reszere|szamara)\s+is|\s+(?:termek|formula|osszetetel|osszetetelben|vitamin|etrendkiegeszito|etrend-kiegeszito)|[.,;])/.test(text))vegan.push('Igen');
 const sensitivity=[];
 for(const [term,label] of freeClaims){
  const claim=new RegExp('\\b'+term+'[ -]*mentes\\b');const negative=new RegExp('\\bnem\\s+'+term+'[ -]*mentes\\b');
  // Explicit Hungarian coordinated claims: "Glutén-, laktóz- és cukormentes".
  const chain=new RegExp('\\b'+term+'-(?:,\\s*[a-z]+-)*(?:,?\\s+es\\s+)[a-z]+mentes\\b');
  if((claim.test(text)||chain.test(text))&&!negative.test(text))sensitivity.push(label);
 }
 const age=[];if(cols.some(c=>c.handle==='gyerekeknek'))age.push('Gyermekeknek');if(cols.some(c=>c.handle==='50'))age.push('50+');
 const skin=[];if(/\berzekeny borre (?:ajanlott|kifejlesztett|keszult)\b/.test(text)||/\berzekeny bor\b/.test(title))skin.push('érzékeny');
 return {category:cols.map(c=>c.handle),age,skin,form:form?[form[1]]:[],vegan,sensitivity,area:cols.filter(c=>areas.has(c.handle)).map(c=>c.handle),brand:p.vendor?[p.vendor]:[]};
}
export function filterProducts(products,attributes,state,omit){
 return products.filter(p=>{
  const price=Number(p.priceRange.minVariantPrice.amount);if(!Number.isFinite(price)||price<=0)return false;
  if(omit!=='price'&&((state.min!==''&&price<Number(state.min))||(state.max!==''&&price>Number(state.max))))return false;
  const attrs=attributes[p.id]??{};
  return FACET_FIELDS.every(f=>f===omit||!state[f].length||state[f].some(v=>(attrs[f]??[]).includes(v)));
 });
}
export function sortProducts(products,sort){
 const rows=products.slice(),collator=new Intl.Collator('hu',{numeric:true,sensitivity:'base'}),name=(a,b)=>collator.compare(a.title,b.title)||a.id.localeCompare(b.id);
 if(sort==='name-asc')rows.sort(name);else if(sort==='name-desc')rows.sort((a,b)=>-name(a,b));else if(sort==='price-asc'||sort==='price-desc'){const sign=sort==='price-asc'?1:-1;rows.sort((a,b)=>sign*(Number(a.priceRange.minVariantPrice.amount)-Number(b.priceRange.minVariantPrice.amount))||name(a,b));}
 return rows;
}
export function filterHref(base,state){
 const [path,query]=base.split('?'),q=new URLSearchParams(query??'');for(const f of [...FACET_FIELDS,'sort','limit','min','max','page'])q.delete(f);
 if(state.sort!=='default')q.set('sort',state.sort);if(state.limit!==24)q.set('limit',String(state.limit));if(state.min!=='')q.set('min',state.min);if(state.max!=='')q.set('max',state.max);
 for(const f of FACET_FIELDS)for(const v of state[f])q.append(f,v);
 return path+(q.size?'?'+q:'');
}
