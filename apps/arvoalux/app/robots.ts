import type { MetadataRoute } from "next";
import { headers } from "next/headers";
export const dynamic="force-dynamic";
export default async function robots():Promise<MetadataRoute.Robots> {
 const host=(await headers()).get("host")?.toLowerCase();
 if(!host || !["arvoalux.hu","www.arvoalux.hu"].includes(host)) return {rules:{userAgent:"*",disallow:"/"}};
 return {rules:{userAgent:"*",allow:"/",disallow:["/api/","/checkout","/cart","/account","/login","/search","/hirlevel/"]},sitemap:"https://www.arvoalux.hu/sitemap.xml"};
}
