import { CartProvider } from "./CommerceCart";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import type { Brand } from "../types";
import {
  storefront,
  loadCatalogCollections,
  COLLECTIONS_QUERY,
  COLLECTIONS_QUERY_TOKENLESS,
  cacheTags,
  visibleCollections,
  type CollectionSummary,
  type RawCollectionNode,
} from "../shopify";
import { Header } from "./layout/Header";
import { Footer } from "./layout/Footer";
import { MobileBottomNav } from "./layout/MobileBottomNav";

export async function BrandLayout({ brand, children }: { brand: Brand; children: ReactNode }) {
  const t = brand.theme;
  // Only the brand identity bits drive the shared light design: the accent
  // colour, radius and fonts. Page chrome stays neutral/structural.
  const vars = {
    "--accent": t.accent,
    "--primary": t.accent,
    "--primary-foreground": t.accentFg,
    "--accent-fg": t.accentFg,
    "--radius": t.radius,
    "--font-display": t.fontDisplay,
    "--font-body": t.fontBody,
  } as React.CSSProperties;

  // Storefront collections feed the header drawer, mobile nav and category grid.
  // Cached + brand-tagged so all consumers share one request per render.
  let collections: CollectionSummary[] = [];
  try {
    if (brand.handle === "arvoalux") { collections = visibleCollections(await loadCatalogCollections(brand.handle)); } else {
    const data = await storefront<{ collections: { nodes: RawCollectionNode[] } }>(
      brand.handle,
      COLLECTIONS_QUERY,
      { first: 250 },
      {
        tags: [cacheTags.brand(brand.handle)],
        tokenlessQuery: COLLECTIONS_QUERY_TOKENLESS,
      }
    );
    collections = visibleCollections(data.collections.nodes);
    }
  } catch {
    collections = [];
  }

  return (
    <html data-catalog-integration="owner-catalog-v1" lang="hu" style={vars} data-brand={brand.handle}>
      <head>
        <link rel="stylesheet" href="/commerce-cart.css" />
        <link rel="stylesheet" href={t.fontHref} />
        {brand.handle !== "arvoalux" && <>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@500;600;700;800&display=swap"
        />
        </>}
        {brand.handle !== "arvoalux" && <title>{`${brand.name} — ${brand.tagline}`}</title>}
      </head>
      <body><CartProvider brand={brand.handle}>
        <Header brand={brand} collections={collections} />
        <main className="flex-1 pb-[60px] md:pb-0">{children}</main>
        <Footer brand={brand} />
        <MobileBottomNav brand={brand} collections={collections} />
        <Toaster position="top-right" richColors closeButton />
      </CartProvider></body>
    </html>
  );
}
