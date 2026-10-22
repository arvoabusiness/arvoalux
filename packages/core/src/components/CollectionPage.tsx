import type {Brand} from "../types";
import {CategoryLandingPage} from "./CategoryLandingPage";
export type CollectionSearchParams=Record<string,string|string[]|undefined>;
export async function CollectionPage({brand,handle,searchParams={}}:{brand:Brand;handle:string;searchParams?:CollectionSearchParams}){return CategoryLandingPage({brand,handle,searchParams});}
