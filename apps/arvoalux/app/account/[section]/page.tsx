import {notFound} from "next/navigation";
import {CustomerAccount} from "../../../../../packages/core/src/components/account/CustomerAccount";
export const dynamic="force-dynamic";
export const metadata={robots:{index:false,follow:false}};
const sections=["profile","addresses","newsletter","wishlist","orders"] as const;
export default async function Page({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!sections.includes(section as typeof sections[number]))notFound();return <CustomerAccount section={section as typeof sections[number]}/>;}
