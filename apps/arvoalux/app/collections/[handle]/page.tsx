import { CollectionPage } from "@arvoalux/core";
import { brand } from "@/brand.config";

export const revalidate = 300;

export default async function Page({ params, searchParams }: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { handle } = await params;
  return <CollectionPage brand={brand} handle={handle} searchParams={await searchParams} />;
}
