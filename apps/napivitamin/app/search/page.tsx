import { SearchPage } from "@arvoalux/core";
import { brand } from "@/brand.config";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return <SearchPage brand={brand} query={q ?? ""} />;
}
