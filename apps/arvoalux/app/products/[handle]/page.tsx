import { ProductPage } from "@arvoalux/core";
import { brand } from "@/brand.config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadSeoProduct, origin, plainDescription } from "../../seo";
export async function generateMetadata({params}:{params:Promise<{handle:string}>}):Promise<Metadata> {
  const {handle}=await params;const p=await loadSeoProduct(handle);
  if(!p || Number(p.priceRange.minVariantPrice.amount)<=0) notFound();
  const title=p.title+" | Arvoa Lux";const description=plainDescription(p.descriptionHtml);
  const url=origin+"/products/"+handle;
  return {title,description,alternates:{canonical:url},openGraph:{title,description,url,type:"website",...(p.featuredImage?{images:[{url:p.featuredImage.url,alt:p.featuredImage.altText||p.title}]}:{})}};
}

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const p=await loadSeoProduct(handle);
  if(!p || Number(p.priceRange.minVariantPrice.amount)<=0) notFound();
  const url=origin+"/products/"+handle;
  const structured={"@context":"https://schema.org","@type":"Product",name:p.title,description:plainDescription(p.descriptionHtml),url,...(p.featuredImage?{image:[p.featuredImage.url]}:{}),...(p.vendor?{brand:{"@type":"Brand",name:p.vendor}}:{}),offers:{"@type":"Offer",url,price:p.priceRange.minVariantPrice.amount,priceCurrency:p.priceRange.minVariantPrice.currencyCode}};
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g,"\\u003c")}}/><ProductPage brand={brand} handle={handle} /></>;
}
