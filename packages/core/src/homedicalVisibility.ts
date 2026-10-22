import scope from './homedical-scope.json';
const products=new Set<string>(scope.products),variants=new Set<string>(scope.variants);
export function homedicalVariantAllowed(brand:string|undefined,id:string):boolean { return brand==='arvoalux'||!variants.has(id); }
export function restrictCatalog<T>(data:T,brand:string):T {
 if(brand==='arvoalux')return data;
 const visit=(value:any):any=>{
  if(Array.isArray(value))return value.map(visit).filter(x=>x!==undefined);
  if(value===null||typeof value!=='object')return value;
  if(typeof value.id==='string'&&(products.has(value.id)||variants.has(value.id)))return undefined;
  if('node'in value&&value.node&&visit(value.node)===undefined)return undefined;
  return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,visit(v)??null]));
 };
 return visit(data) as T;
}
