import {brand} from "@/brand.config";
import {loadPromotions} from "../../../../packages/core/src/promotions";
import {PaginatedProductGrid} from "../../../../packages/core/src/components/product/PaginatedProductGrid";
export const dynamic="force-dynamic";export const maxDuration=60;export const metadata={title:"Akciók"};
export default async function Page(){let data;try{data=await loadPromotions(brand.handle);}catch{return <section className="mx-auto max-w-7xl px-4 py-8" data-sale-status="unavailable"><h1 className="text-3xl font-bold">Akciók</h1><p className="mt-6">Az akciós termékek jelenleg nem tölthetők be. Kérjük, próbáld újra később.</p></section>;}
return <section className="mx-auto max-w-7xl px-4 py-8" data-sale-status={data.products.length?"populated":"empty"} data-sale-count={data.products.length} data-sale-scanned={data.scanned}><h1 className="text-3xl font-bold">Akciók</h1><p className="my-6">{data.products.length?`${data.products.length} akciós termék`:"Jelenleg nincs akciós termék."}</p>{data.products.length>0&&<PaginatedProductGrid products={data.products} brandHandle={brand.handle} pageSize={24}/>}</section>;}
