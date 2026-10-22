import {CategoryLandingPage} from "@arvoalux/core";
import {brand} from "@/brand.config";
export const revalidate=300;
export const maxDuration=60;
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){return <CategoryLandingPage brand={brand} slug={(await params).slug} searchParams={await searchParams}/>;}
