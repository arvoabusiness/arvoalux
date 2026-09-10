# Arvoalux Platform — Multi-Brand Storefronts (Option B: shared core)

A monorepo where every brand is its own standalone Next.js app with its own
domain, but all the logic and UI live once in a shared `@arvoalux/core`
package. Fix or improve something in core → every brand inherits it on its next
deploy. Each app still deploys independently and can diverge in design.

Each brand app must bind to its own owner-authorized Shopify store or sales
channel. Shared code does not imply a shared catalog, credential, or ad account.

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

Configure each app independently. Arvoa Lux core product and collection reads use
Shopify Storefront API 2026-07 tokenless access by default:

```bash
SHOPIFY_STORE_DOMAIN=arvoalux.myshopify.com \
SHOPIFY_STOREFRONT_API_VERSION=2026-07 \
npm run dev:arvoalux
```

Only when an auth-only Storefront field is required, set the explicit
`SHOPIFY_STOREFRONT_PRIVATE_TOKEN` (or
`SHOPIFY_STOREFRONT_PRIVATE_TOKEN_<HANDLE>`) for that app. Never use
`SHOPIFY_PRIVATE_TOKEN` or a revalidation secret as Storefront authentication.

Run another app only after binding its own authorized store/channel:

```bash
npm run dev -w @arvoalux/brand-biobarat -- -p 3001
```

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
  its own domain and owner-authorized `SHOPIFY_STORE_DOMAIN`.
- Storefront tokens are optional for core reads; when needed, use only explicit
  `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` names scoped to that brand/project.
- Never copy Arvoa Lux catalog credentials into another brand project.
- Bumping core and redeploying an app picks up the shared code change.
