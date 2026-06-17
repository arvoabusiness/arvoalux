import { ProductPage } from "@arvoalux/core";
import { brand } from "@/brand.config";

export const revalidate = 300;

export default async function Page({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  return <ProductPage brand={brand} handle={handle} />;
}
