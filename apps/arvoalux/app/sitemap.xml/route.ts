import { origin, productUrls } from "../seo";
export const dynamic="force-dynamic";
export const maxDuration=60;
const escapeXml=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
export async function GET() {
 try {
   const urls=[origin+"/",origin+"/akciok",origin+"/magazin",...await productUrls()];
   if(urls.length>50000) throw new Error("Sitemap size exceeded");
   return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls.map(url=>"<url><loc>"+escapeXml(url)+"</loc></url>").join("")+"</urlset>",{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=300, s-maxage=300"}});
 } catch {return new Response("Sitemap temporarily unavailable",{status:503,headers:{"Retry-After":"300","Cache-Control":"no-store"}});}
}
