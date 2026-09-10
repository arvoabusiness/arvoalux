import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  getHeroCampaigns,
  heroBrandHandles,
  supportingHeroCampaigns,
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

const expectedPrimaryTitles: Record<string, string> = {
  arvoalux: "Keresés: multivitamin — Arvoalux",
  biobarat: "Keresés: immun — BioBarát",
  boltbio: "Keresés: probiotikum — BoltBio",
  nagykervitamin: "Keresés: C-vitamin — Nagy Kervitamin",
  napivitamin: "Keresés: multivitamin — Napi Vitamin",
  nutrimarket: "Keresés: omega-3 — NutriMarket",
  prevenciobolt: "Keresés: D-vitamin — Prevenciobolt",
  provitaminok: "Keresés: magnézium — ProVitaminok",
  vitaminbolt: "Keresés: kollagén — VitaminBolt",
};

const unsupportedClaim = /EXTRA17|(?:^|\s)-?\d{1,2}\s*%|\b\d[\d\s.,]*\s*Ft\b|\bTODO\b/i;
const unsupportedPromise = /természetesebb|népszerű|választó|hasonlítsd|összehasonlít|elérhetőség|szűkítsd|aktuális ár|prémium|szezonhoz illő|kategóriában|szezonális/i;

test("defines a distinct primary autumn campaign for all nine storefronts", () => {
  assert.deepEqual([...heroBrandHandles].sort(), [...expectedHandles].sort());
  const titles = new Set<string>();
  for (const handle of expectedHandles) {
    const campaigns = getHeroCampaigns(handle);
    assert.equal(campaigns.length, 4);
    assert.equal(campaigns[0].brandHandle, handle);
    assert.equal(campaigns[0].title, expectedPrimaryTitles[handle]);
    assert.match(campaigns[0].href, /^\/search\?q=\S+/);
    assert.ok(!unsupportedClaim.test(JSON.stringify(campaigns)));
    titles.add(campaigns[0].title);
  }
  assert.equal(titles.size, 9);
});

test("uses three shared evidence-safe supporting need-state banners", () => {
  assert.equal(supportingHeroCampaigns.length, 3);
  for (const campaign of supportingHeroCampaigns) {
    assert.match(campaign.href, /^\/search\?q=\S+/);
    assert.equal(campaign.season, "autumn");
    assert.ok(!unsupportedClaim.test(JSON.stringify(campaign)));
  }
});

test("passes brand context into HeroBanner and removes unsupported hardcoded offers", () => {
  const homePage = readFileSync(resolve(here, "../src/components/HomePage.tsx"), "utf8");
  const hero = readFileSync(resolve(here, "../src/components/home/HeroBanner.tsx"), "utf8");
  assert.match(homePage, /<HeroBanner\s+brand=\{brand\}\s*\/>/);
  assert.ok(!unsupportedClaim.test(hero));
  assert.doesNotMatch(hero, /images\.unsplash\.com/);
});

test("does not promise popularity, comparison, selection tools, or explicit availability", () => {
  for (const handle of expectedHandles) {
    assert.doesNotMatch(JSON.stringify(getHeroCampaigns(handle)), unsupportedPromise, handle);
  }
  const hero = readFileSync(resolve(here, "../src/components/home/HeroBanner.tsx"), "utf8");
  assert.doesNotMatch(hero, unsupportedPromise);
});

test("each campaign CTA starts one focused search term", () => {
  for (const handle of expectedHandles) {
    for (const campaign of getHeroCampaigns(handle)) {
      const query = new URL(campaign.href, "https://example.test").searchParams.get("q");
      assert.ok(query, `${handle}:${campaign.id} must include q`);
      assert.equal(query.trim().split(/\s+/).length, 1, `${handle}:${campaign.id} combines search terms`);
    }
  }
});

test("uses a high-contrast universal keyboard focus treatment", () => {
  const hero = readFileSync(resolve(here, "../src/components/home/HeroBanner.tsx"), "utf8");
  assert.doesNotMatch(hero, /focus-visible:ring-brand/);
  assert.doesNotMatch(hero, /focus-visible:ring-gray-950/);
  assert.match(hero, /focus-visible:ring-black/);
  assert.match(hero, /focus-visible:ring-offset-4/);
});

test("keeps primary small text at full opacity on a guaranteed dark surface", () => {
  const hero = readFileSync(resolve(here, "../src/components/home/HeroBanner.tsx"), "utf8");
  assert.match(hero, /brand: "bg-gray-950 text-white"/);
  assert.doesNotMatch(hero, /opacity-(70|75|80|85)/);
});
