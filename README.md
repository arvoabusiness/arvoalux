# Arvoalux Platform — Multi-Brand Storefronts (Option B: shared core)

A monorepo where every brand is its own standalone Next.js app with its own
domain, but all the logic and UI live once in a shared `@arvoalux/core`
package. Fix or improve something in core → every brand inherits it on its next
deploy. Each app still deploys independently and can diverge in design.

All brand apps point at **one shared Shopify store**.

```
arvoalux-platform/
  packages/core/          @arvoalux/core — the shared brains
    src/
      shopify.ts          Storefront API client + queries + cart mutations
      cart.ts             cart server actions (per-brand cookie + attribution)
      types.ts            Brand / BrandTheme contract
      components/         BrandLayout, HomePage, ProductPage, CartPage
      styles.css          theme-variable-driven styles
  apps/
    arvoalux/             thin: brand.config.ts + 4 one-line pages
    biobarat/             thin: brand.config.ts + 4 one-line pages
  scripts/
    seed.mjs              seed the Shopify store (collections + products)
    new-brand.mjs         scaffold a new brand app
```

## What's "thin" about a brand app

Everything except `brand.config.ts` is identical boilerplate that just
delegates to core. Example — the entire home page of a brand:

```tsx
import { HomePage } from "@arvoalux/core";
import { brand } from "@/brand.config";
export const dynamic = "force-dynamic";
export default function Page() { return <HomePage brand={brand} />; }
```

The real per-brand file is `brand.config.ts`: identity, domains, Shopify
collection, and the full theme (colors, fonts, radius). That's where a brand
diverges in look and feel.

## Run

```bash
npm install
```

Start simple with **one shared token** for all brands (same as the single-app
setup). Set it once and it's written into every app's `.env`:

```bash
SHOPIFY_STORE_DOMAIN=arvoalux-platform-dev.myshopify.com \
SHOPIFY_PRIVATE_TOKEN=shpat_xxx \
node scripts/sync-env.mjs
```

Then run an app:

```bash
npm run dev:arvoalux   # http://localhost:3000
npm run dev -w @arvoalux/brand-biobarat -- -p 3001
```

Later, if you want a brand to use its own Headless storefront token, add
`SHOPIFY_PRIVATE_TOKEN_<HANDLE>` to that app's `.env` — it overrides the shared
one for that brand only. No code change needed.

Each app is single-brand, so no host/middleware routing — the app *is* the
brand. In production each app gets its own domain.

### Note: network fix baked in

The app scripts run Node with `--no-network-family-autoselection` (via
`NODE_OPTIONS`). This is required on dual-stack machines/servers with a broken
or unrouted IPv6 path, where Node's parallel IPv4/IPv6 connection racing stalls
and requests to Shopify time out (ETIMEDOUT) even though IPv4 works. The flag
forces a single clean connection. It's harmless on IPv6-capable hosts, so it's
on everywhere. If you run the app some other way (custom server, Docker
CMD), carry the same `NODE_OPTIONS` over.

## Add a brand

```bash
npm run new-brand -- napivitamin "Napi Vitamin"
# then edit apps/napivitamin/brand.config.ts (theme, domains, tagline)
# and add apps/napivitamin/.env
npm install && npm run dev -w @arvoalux/brand-napivitamin
```

## Seed the Shopify store

Same script as before — creates the 9 `brand-<handle>` collections and sample
products, publishes to all channels. Run once against the store (Dev Dashboard
app with Admin scopes installed):

```bash
node --env-file=.env.seed scripts/seed.mjs
```

## Deploy

- One project/deployment per brand app (e.g. a Vercel project each), each with
  its own domain and its own `SHOPIFY_PRIVATE_TOKEN` env.
- All apps share the same `SHOPIFY_STORE_DOMAIN`.
- Bumping core and redeploying an app picks up the shared change.
