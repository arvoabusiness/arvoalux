import { NextResponse } from "next/server";
import { predictiveSearchProducts } from "@arvoalux/core";
import { brand } from "@/brand.config";

// Predictive-search suggestions for the header autocomplete (SearchBar).
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const products = await predictiveSearchProducts(brand.handle, q);
  return NextResponse.json({ products });
}
