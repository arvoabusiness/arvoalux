import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  getHeroBanners,
  heroBrandHandles,
  type HeroSlot,
} from "../src/components/home/heroCampaigns.ts";

const here = dirname(fileURLToPath(import.meta.url));
const expectedHandles = [
  "arvoalux",
  "biobarat",
  "boltbio",
  "nagykervitamin",
  "napivitamin",
  "nutrimarket",
  "prevenciobolt",
  "provitaminok",
  "vitaminbolt",
];
const expectedSlots: HeroSlot[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-wide",
  "bottom-small-1",
  "bottom-small-2",
  "bottom-small-3",
];
const bannedCommercialClaims = /EXTRA17|(?:^|\s)-?\d{1,2}\s*%|\b\d[\d\s.,]*\s*Ft\b|\bCsak\b|bestseller|legnépszerűbb|gyógyít|megelőzi/i;
const bannedQuickSearch = /Gyorskeresések|GYORSKERESÉS|Keresés:\s/i;

function source(file: string) {
  return readFileSync(resolve(here, file), "utf8");
}

test("defines the locked seven-banner mosaic for all nine storefronts", () => {
  assert.deepEqual([...heroBrandHandles].sort(), [...expectedHandles].sort());
  for (const handle of expectedHandles) {
    const banners = getHeroBanners(handle);
    assert.equal(banners.length, 7, handle);
    assert.deepEqual(banners.map((banner) => banner.slot), expectedSlots, handle);
    assert.equal(banners.filter((banner) => banner.isPrimary).length, 1, handle);
    assert.equal(banners.find((banner) => banner.isPrimary)?.slot, "top-center", handle);
    assert.ok(banners.every((banner) => banner.mobileCta === "Megnézem"), handle);
  }
});

test("uses only verified focused category destinations", () => {
  const expectedQueries: Record<string, string> = {
    "organic-magnesium": "magnézium",
    "adult-multivitamin": "multivitamin",
    "omega-three": "omega-3",
    "c-vitamin": "C-vitamin",
    "d-three-vitamin": "D-vitamin",
    "vegan-probiotics": "probiotikum",
    "collagen-complex": "kollagén",
  };
  for (const handle of expectedHandles) {
    for (const banner of getHeroBanners(handle)) {
      assert.match(banner.href, /^\/search\?q=[^\s&]+$/);
      const query = new URL(banner.href, "https://example.test").searchParams.get("q");
      assert.equal(query, expectedQueries[banner.id]);
      assert.equal(banner.cta, "Kínálat megtekintése");
      assert.ok(banner.title.trim());
      assert.ok(banner.cta.trim());
      assert.doesNotMatch(JSON.stringify(banner), bannedCommercialClaims, `${handle}:${banner.slot}`);
      assert.doesNotMatch(JSON.stringify(banner), bannedQuickSearch, `${handle}:${banner.slot}`);
    }
  }
});

test("restores the original desktop 3 plus 4 grid geometry", () => {
  const hero = source("../src/components/home/HeroBanner.tsx");
  assert.match(hero, /grid-cols-12\s+grid-rows-\[280px_220px\]\s+gap-4/);
  assert.match(hero, /"top-left": "col-span-3"/);
  assert.match(hero, /"top-center": "col-span-5"/);
  assert.match(hero, /"top-right": "col-span-4"/);
  assert.match(hero, /"bottom-wide": "col-span-4"/);
  assert.match(hero, /"bottom-small-1": "col-span-3"/);
  assert.match(hero, /"bottom-small-2": "col-span-2"/);
  assert.match(hero, /"bottom-small-3": "col-span-3"/);
});

test("removes the rejected quick-search hero and its decorative card system", () => {
  const hero = source("../src/components/home/HeroBanner.tsx");
  const campaigns = source("../src/components/home/heroCampaigns.ts");
  assert.doesNotMatch(hero, bannedQuickSearch);
  assert.doesNotMatch(campaigns, bannedQuickSearch);
  assert.doesNotMatch(hero, /SupportingCard|CampaignIcon|rounded-3xl/);
});

test("keeps brand context while leaving header navigation and downstream sections untouched", () => {
  const homePage = source("../src/components/HomePage.tsx");
  assert.match(homePage, /<HeroBanner\s+brand=\{brand\}\s*\/>/);
  assert.match(homePage, /<HomepageCategorySection\s+brand=\{brand\}\s*\/>/);
  assert.match(homePage, /<DeliveryInfoBar\s*\/>/);
  assert.match(homePage, /<FeaturedProductsSection\s+brand=\{brand\}\s*\/>/);
});

test("keeps verified package details and prevents product-image cropping", () => {
  const banners = getHeroBanners("arvoalux");
  const magnesium = banners.find((banner) => banner.id === "organic-magnesium");
  const omega = banners.find((banner) => banner.id === "omega-three");
  const cVitamin = banners.find((banner) => banner.id === "c-vitamin");
  assert.equal(magnesium?.description, "JutaVit");
  assert.doesNotMatch(magnesium?.imageAlt ?? "", /120/);
  assert.equal(omega?.subtitle, "1200 mg halolaj + E-vitamin");
  assert.equal(omega?.title, "Omega-3");
  assert.equal(omega?.imageAlt, "JutaVit Omega-3, 1200 mg halolajjal és E-vitaminnal, 100 kapszula");
  assert.equal(cVitamin?.description, "JutaVit · 100 db");
  assert.equal(banners.find((banner) => banner.id === "collagen-complex")?.description, "60 filmtabletta");
  const hero = source("../src/components/home/HeroBanner.tsx");
  assert.match(hero, /object-contain/);
  assert.match(hero, /object-contain object-right/);
  assert.doesNotMatch(hero, /object-cover/);
  assert.doesNotMatch(hero, /group-hover:scale/);
});

test("uses natural Hungarian announcement copy", () => {
  const hero = source("../src/components/home/HeroBanner.tsx");
  assert.match(hero, /Fedezd fel vitaminjainkat és étrend-kiegészítőinket\./);
  assert.doesNotMatch(hero, /vitamin- és étrend-kiegészítő kínálatunkat/);
});

test("preserves exactly one semantic section h1 and uses h2 for duplicated grids", () => {
  const hero = source("../src/components/home/HeroBanner.tsx");
  assert.match(hero, /<h1 className="sr-only">/);
  const bannerContent = hero.match(/function BannerContent[\s\S]*?function HeroTile/)?.[0] ?? "";
  assert.doesNotMatch(bannerContent, /<h1/);
  assert.match(bannerContent, /<h2/);
  assert.match(hero, /const ctaLabel = compact \? banner\.mobileCta/);
});

test("keeps mobile ordering campaign-first with touch-safe links and no horizontal overflow", () => {
  const hero = source("../src/components/home/HeroBanner.tsx");
  assert.match(hero, /mobileBanners/);
  assert.match(hero, /banner\.isPrimary/);
  assert.match(hero, /!desktop && !banner\.isPrimary/);
  assert.match(hero, /gap-1 px-2 text-xs/);
  assert.match(hero, /min-h-\[200px\]/);
  assert.match(hero, /block h-full/);
  assert.match(hero, /overflow-hidden/);
  assert.doesNotMatch(hero, /overflow-x-(auto|scroll)/);
  assert.match(hero, /focus-visible:ring-black/);
});
