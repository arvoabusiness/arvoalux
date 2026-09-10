import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  getHeroBannerConfigs,
  heroBrandHandles,
  resolveHeroBanners,
  type HeroCollectionData,
  type HeroProductData,
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
    const configs = getHeroBannerConfigs(handle);
    assert.equal(configs.length, 7, handle);
    assert.deepEqual(configs.map((banner) => banner.slot), expectedSlots, handle);
    assert.equal(configs.filter((banner) => banner.isPrimary).length, 1, handle);
    assert.equal(configs.find((banner) => banner.isPrimary)?.slot, "top-center", handle);
  }
});

test("supports Shopify 2026-07 tokenless core storefront reads", () => {
  const shopify = source("../src/shopify.ts");
  assert.match(shopify, /\?\? "2026-07"/);
  assert.doesNotMatch(shopify, /No Storefront API token configured/);
  assert.match(shopify, /if \(privateToken\)/);
  assert.match(shopify, /else if \(publicToken\)/);
});

test("never treats the revalidation secret as a Storefront credential", () => {
  const shopify = source("../src/shopify.ts");
  assert.doesNotMatch(shopify, /process\.env\[`SHOPIFY_PRIVATE_TOKEN_/);
  assert.doesNotMatch(shopify, /process\.env\.SHOPIFY_PRIVATE_TOKEN/);
});

test("documents the authorized Arvoa Lux Storefront target", () => {
  const envExample = source("../../../apps/arvoalux/.env.example");
  assert.match(envExample, /^SHOPIFY_STORE_DOMAIN=arvoalux\.myshopify\.com$/m);
  assert.match(envExample, /^SHOPIFY_STOREFRONT_API_VERSION=2026-07$/m);
});

test("does not document revalidation-secret names as Storefront auth", () => {
  const readme = source("../../../README.md");
  assert.doesNotMatch(readme, /SHOPIFY_PRIVATE_TOKEN=shpat_/);
  assert.doesNotMatch(readme, /SHOPIFY_PRIVATE_TOKEN_<HANDLE>/);
  assert.match(readme, /SHOPIFY_STOREFRONT_PRIVATE_TOKEN/);
});

test("loads hero content from Shopify and hides an incomplete hero safely", () => {
  const hero = source("../src/components/home/HeroBanner.tsx");
  assert.match(hero, /loadHeroBanners/);
  assert.match(hero, /export async function HeroBanner/);
  assert.match(hero, /await loadHeroBanners\(brand\.handle\)/);
  assert.match(hero, /if \(banners\.length !== 7\) return null/);
});

test("configures real Shopify product handles without hardcoded product payloads", () => {
  const expectedProductHandles: Record<string, string> = {
    "organic-magnesium": "jutavit-szerves-magnezium-b6-d3-70x-2455",
    "adult-multivitamin": "jutavit-multivitamin-felnotteknek-filmtabletta-45x-1277",
    "omega-three": "jutavit-omega-3-1200mg-e-vitamin-kapszula-100x-1282",
    "c-vitamin": "jutavit-c-vitamin-1000-mg-nyujtott-kioldodasu-csipkebogyo-d3-vitamin-cink-100-db-1229",
    "d-three-vitamin": "jutavit-d3-vitamin-4000ne-forte-tabletta-100x-1238",
    "vegan-probiotics": "your-vitamin-healthy-life-probiotics-vegan-4776",
    "collagen-complex": "jutavit-kollagen-komplex-60x-2457",
  };
  const products: HeroProductData[] = Object.values(expectedProductHandles).map((productHandle, index) => ({
    id: `gid://shopify/Product/${index + 1}`,
    handle: productHandle,
    title: `Shopify product ${index + 1}`,
    vendor: "Verified vendor",
    availableForSale: true,
    featuredImage: { url: `https://cdn.shopify.com/product-${index + 1}.jpg`, altText: `Product ${index + 1}` },
  }));
  for (const handle of expectedHandles) {
    for (const banner of resolveHeroBanners(handle, products, [])) {
      assert.equal(banner.type, "product");
      assert.equal(banner.productHandle, expectedProductHandles[banner.id]);
      assert.equal(banner.href, `/products/${banner.productHandle}`);
      assert.equal(banner.cta, "Megnézem");
      assert.ok(banner.title.trim());
      assert.ok(banner.image?.trim());
      assert.doesNotMatch(JSON.stringify(banner), bannedCommercialClaims, `${handle}:${banner.slot}`);
      assert.doesNotMatch(JSON.stringify(banner), bannedQuickSearch, `${handle}:${banner.slot}`);
    }
  }
  const campaigns = source("../src/components/home/heroCampaigns.ts");
  assert.doesNotMatch(campaigns, /cdn\.shopify\.com/);
  assert.doesNotMatch(campaigns, /const verifiedBanners/);
  assert.match(campaigns, /resolveHeroBanners/);
});

test("falls back to a verified collection when a configured product is unavailable", () => {
  const unavailable: HeroProductData = {
    id: "gid://shopify/Product/unavailable",
    handle: "jutavit-szerves-magnezium-b6-d3-70x-2455",
    title: "Unavailable product",
    vendor: "JutaVit",
    availableForSale: false,
    featuredImage: null,
  };
  const collection: HeroCollectionData = {
    id: "gid://shopify/Collection/magnezium",
    handle: "magnezium",
    title: "Magnézium",
    image: null,
  };
  const resolved = resolveHeroBanners("arvoalux", [unavailable], [collection]);
  assert.equal(resolved.length, 1);
  assert.equal(resolved[0]?.type, "collection");
  assert.equal(resolved[0]?.href, "/collections/magnezium");
  assert.equal(resolved[0]?.cta, "Kategória megtekintése");
  assert.equal(resolved[0]?.productHandle, undefined);
});

test("keeps secondary typography readable and normalizes Shopify media canvases", () => {
  const hero = source("../src/components/home/HeroBanner.tsx");
  const campaigns = source("../src/components/home/heroCampaigns.ts");
  assert.doesNotMatch(hero, /text-\[(?:10|11)px\]/);
  assert.match(hero, /text-xs sm:text-sm/);
  assert.match(hero, /min-h-\[320px\]/);
  assert.match(hero, /mix-blend-multiply/);
  assert.match(campaigns, /imageScale: "large"/);
  assert.match(campaigns, /imageScale: "xlarge"/);
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

test("keeps Shopify product copy dynamic and prevents product-image cropping", () => {
  const campaigns = source("../src/components/home/heroCampaigns.ts");
  assert.doesNotMatch(campaigns, /1200 mg|100 kapszula|60 filmtabletta|100 db|45 filmtabletta/);
  assert.match(campaigns, /title: product\.title/);
  assert.match(campaigns, /image: product\.featuredImage\.url/);
  assert.match(campaigns, /imageAlt: product\.featuredImage\.altText \?\? product\.title/);
  const hero = source("../src/components/home/HeroBanner.tsx");
  assert.match(hero, /object-contain/);
  assert.match(hero, /object-contain mix-blend-multiply/);
  assert.match(hero, /sm:object-right/);
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
  assert.match(hero, /min-h-\[240px\]/);
  assert.match(hero, /min-h-\[320px\] sm:min-h-\[240px\]/);
  assert.match(hero, /block h-full/);
  assert.match(hero, /overflow-hidden/);
  assert.doesNotMatch(hero, /overflow-x-(auto|scroll)/);
  assert.match(hero, /focus-visible:ring-\[#b9923f\]/);
});
