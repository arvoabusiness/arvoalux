import type { ReactNode } from "react";
import { Toaster } from "sonner";
import type { Brand } from "../types";
import {
  storefront,
  COLLECTIONS_QUERY,
  cacheTags,
  visibleCollections,
  type CollectionSummary,
  type RawCollectionNode,
} from "../shopify";
import { Header } from "./layout/Header";
import { Footer } from "./layout/Footer";
import { MobileBottomNav } from "./layout/MobileBottomNav";
import { NewsletterPopup } from "./popup/NewsletterPopup";

export async function BrandLayout({ brand, children }: { brand: Brand; children: ReactNode }) {
  const t = brand.theme;
  // Only the brand identity bits drive the shared light design: the accent
  // colour, radius and fonts. Page chrome stays neutral/structural.
  const vars = {
    "--brand-bg": t.bg,
    "--brand-surface": t.surface,
    "--brand-fg": t.fg,
    "--brand-muted": t.muted,
    "--accent": t.accent,
    "--accent-fg": t.accentFg,
    "--radius": t.radius,
    "--font-display": t.fontDisplay,
    "--font-body": t.fontBody,
  } as React.CSSProperties;

  // Storefront collections feed the header drawer, mobile nav and category grid.
  // Cached + brand-tagged so all consumers share one request per render.
  let collections: CollectionSummary[] = [];
  try {
    const data = await storefront<{ collections: { nodes: RawCollectionNode[] } }>(
      brand.handle,
      COLLECTIONS_QUERY,
      { first: 250 },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    collections = visibleCollections(data.collections.nodes);
  } catch {
    collections = [];
  }

  return (
    <html lang="hu" style={vars}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={t.fontHref} />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@500;600;700;800&display=swap"
        />
        <title>{`${brand.name} — ${brand.tagline}`}</title>
      </head>
      <body style={{ backgroundColor: t.bg, color: t.fg }}>
        <Header brand={brand} collections={collections} />
        <main className="flex-1 pb-[60px] md:pb-0">{children}</main>
        <Footer brand={brand} />
        <MobileBottomNav brand={brand} collections={collections} />
        <NewsletterPopup brand={brand} />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
