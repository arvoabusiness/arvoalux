# Phase 1 — Commerce Foundation: Implementation Plan

**Scope:** 9 brand storefronts, each on its own domain, all running off **one
Shopify (Basic) store** with **one shared, neutrally-branded checkout**, built
on the existing shared-core monorepo (Option B).

**Confirmed business decisions (from the store owner):**

| # | Decision | Consequence |
|---|----------|-------------|
| 1 | **Forint (HUF) only** | No Shopify Markets / multi-currency. Current pricing code is already correct. |
| 2 | **Shopify Basic plan** | No per-brand checkout branding (Plus-only). Lower API limits → caching is a priority. |
| 3 | **Neutral checkout identity** (not any single brand's name) | Store + checkout use a **group name** (placeholder: *"Arvoalux Group"*). |
| 4 | **Each brand has its own products** | Low duplicate-content SEO risk. Isolate each brand's catalog per storefront. |

> Placeholder group name **"Arvoalux Group"** and checkout domain
> **`secure.arvoalux-group.hu`** are used below until the client confirms.

---

## Part A — Shopify Admin configuration (no code)

Done once by whoever administers the store. Order matters.

### A1. Set the neutral store + checkout identity
- **Settings → General → Store name** → `Arvoalux Group` (this is what appears
  on the checkout page and in confirmation emails).
- **Settings → Brand** → upload a **neutral/group logo** and set brand colors to
  a neutral palette (used by the single shared checkout).
- **Settings → Checkout → Branding** → confirm the checkout uses the neutral
  brand. On Basic this is **one look for all brands** — that's expected and
  matches decision #3.

### A2. Domains
- **Settings → Domains**: add a neutral **checkout domain** and make it primary,
  e.g. `secure.arvoalux-group.hu`. All `checkoutUrl`s will resolve here.
- **Do NOT** connect the 9 brand domains (`arvoalux.hu`, `biobarat.eu`, …) to
  Shopify — those point to Vercel (the Next apps). Shopify only needs the one
  neutral checkout domain.

### A3. Shared Shopify catalog across all storefronts
All 9 storefronts intentionally use the same Shopify product catalog. Brand
separation is UI/config/domain-level, not product-catalog isolation:
- Install/configure the Headless sales channel for the shared catalog.
- The 9 storefront apps may use the same approved Storefront API token during
  the shared-catalog rollout; per-brand tokens are optional, not required.
- Do not filter or publish products by `brand-<handle>` unless the founder later
  changes this decision.
- The code still supports `SHOPIFY_PRIVATE_TOKEN_<HANDLE>` overrides, but the
  shared token is the intended current configuration.

### A4. Shared products & collections
- All storefronts read the shared Shopify catalog and may expose the same products.
- Brand-specific collections are optional merchandising surfaces, not isolation
  boundaries and must not hide the shared catalog unless explicitly requested.
- Inventory stays central (one stock number per variant), feeding Zoho later.

### A5. Discounts (namespacing)
- Discount codes are **store-global**. Scope each brand's codes to that brand's
  collection so a code can't be used on another brand.
- Convention: prefix per brand, e.g. `BIO-WELCOME10`, restricted to
  `brand-biobarat`.

### A6. Webhooks (for cache refresh — see B1)
- **Settings → Notifications → Webhooks** (or via a custom app): subscribe to
  `products/update`, `products/delete`, `collections/update`,
  `inventory_levels/update`.
- Point them at a revalidation endpoint (built in B1) **or** at n8n, which then
  calls each affected brand app's revalidation URL.

---

## Part B — Code changes (prioritized)

Ranked by impact for a **Basic-plan** launch.

### B1. Caching + on-demand revalidation  ✅ DONE
**Why:** Basic has the lowest API limits. Today every page is
`export const dynamic = "force-dynamic"` and every fetch is
`cache: "no-store"` (`packages/core/src/shopify.ts`). With 9 sites this will
exhaust the Storefront API and slow every page.

**Change:**
- In `storefront()`, replace `cache: "no-store"` with Next's tag-based caching:
  `next: { revalidate: <seconds>, tags: [brandHandle, ...] }`. Make it a
  parameter so the **cart** path stays uncached (carts must be live) while
  **product/collection/home** reads are cached.
- Remove blanket `force-dynamic` from `app/page.tsx` and
  `app/products/[handle]/page.tsx`; use ISR (`export const revalidate = 300`)
  or rely on fetch-level caching. **Cart pages stay dynamic.**
- Add a revalidation route handler in core (consumed by each app), e.g.
  `revalidateTag(brandHandle)` triggered by the A6 webhooks, so edits in Shopify
  refresh the affected brand within seconds without going fully dynamic.

### B2. Per-brand analytics & tracking
**Why:** the marketing stack (Google/Meta/TikTok Ads, Klaviyo) needs per-brand
pixels.
**Change:**
- Extend the `Brand` type (`packages/core/src/types.ts`) with an optional
  `analytics` block: `{ ga4?, metaPixel?, tiktok?, klaviyo? }`.
- Inject the tags in `BrandLayout` (`packages/core/src/components/BrandLayout.tsx`)
  when present. Per-brand IDs live in each `brand.config.ts`.
- Add a consent-banner hook (EU/GDPR — `.eu` + `.hu` are EU) gating non-essential
  pixels.

### B3. Order → brand attribution via n8n
**Why:** each order must be traceable to its brand for reporting, fulfillment,
and per-brand emails — without Plus/Flow.
**Change (mostly n8n, not this repo):**
- The cart already sets `attributes: [{ key: "brand", value: brandHandle }]`
  (`packages/core/src/cart.ts`) — keep it. Optionally also add `_brand_domain`.
- n8n subscribes to the `orders/create` webhook, reads the `brand` attribute,
  and: tags the order `brand:<handle>`, routes/branded-emails via Klaviyo, and
  syncs to Zoho/Airtable. This is the seam to all later PRD phases.

### B4. Per-brand SEO essentials
**Why:** 9 indexable domains. Low duplicate risk (distinct catalogs) but each
brand still needs correct metadata.
**Change:**
- Add Next `generateMetadata` in core page wrappers using `brand.name` /
  per-product data; set `<title>`, description, Open Graph, canonical.
- Per-brand `robots.txt` + `sitemap.xml` (generated from the brand's collection).
- Move the hardcoded `<title>` out of `BrandLayout` into proper metadata.

### B5. Currency hook (no work now, future-proofing)
- Forint-only today. Leave a single `country/language` constant in
  `brand.config.ts` (default `HU`/`hu`) so adding `@inContext` later for an
  EUR-selling brand is a config change, not a refactor. **Do not build Markets
  now.**

### B6. Missing storefront surfaces (incremental)
Current apps have Home / Product / Cart only. Add as needed:
- Collection/listing page with pagination, basic search.
- Blog / landing-page route (target for the future Content Agent).
- `next/image` + `remotePatterns: cdn.shopify.com` if adopting `next/image`.

---

## Part C — Deployment

- **One Vercel project per brand app** (`apps/<handle>`), each mapped to its own
  domain.
- Env per project: shared `SHOPIFY_STORE_DOMAIN` + that brand's
  `SHOPIFY_PRIVATE_TOKEN` (the per-brand Headless token from A3). Carry
  `NODE_OPTIONS="--no-network-family-autoselection"` into the runtime (already in
  the app scripts; replicate in any custom server/Docker).
- Bumping `@arvoalux/core` and redeploying an app picks up shared improvements —
  the core promise of Option B.
- Add CI: typecheck + build all workspaces on PR; preview deploys per app.

---

## Part D — Suggested sequence

1. **A1–A2** neutral identity + checkout domain.
2. **A3–A4** Headless storefronts + products/collections per brand.
3. **B1** caching/revalidation (before going wide — protects API limits).
4. Bring up **2 brands end-to-end** (arvoalux + biobarat) on real domains.
5. **B2 + B4** analytics + SEO.
6. **A6 + B3** webhooks + n8n attribution (bridges into Phase 2/3).
7. Roll out remaining 7 brands via `npm run new-brand` + per-brand config/token.
8. **A5** discount conventions; **B6** extra surfaces as marketing needs them.

---

## What is intentionally NOT in this repo

This repo is the **storefront/presentation layer only**. Shopify is the commerce
source of truth. **Zoho (inventory), Airtable (operations), n8n (automation),
and the AI agents are separate services** that integrate via Shopify's
Admin API + webhooks + n8n — they do not live in this Next monorepo. The
`brand` cart attribute and per-brand collection/token scheme are the seams that
let every later phase attribute everything per brand without re-architecting.

---

## Open item

- Confirm the **neutral group name** and **checkout domain** (placeholders:
  *Arvoalux Group* / `secure.arvoalux-group.hu`). Everything else can proceed.
