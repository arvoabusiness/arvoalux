# Production measurement source handoff — 2026-11-04

## Status: source preserved; draft only, not deployable

This branch preserves the four frontend files already deployed and verified on Arvoa Lux and BioBarat. It is based on `codex/arvoalux-contentsquare` at `d7f3aadda6f15f4d23337c327646df0339112d2c`, a closer starting point than `main` (`132c575b1bd1e9f19004257e0871861b72a31c79`). It is **not a complete replacement for either production deployment**. Do not merge or promote it until the integration gaps below are resolved.

The repairs make consent preference storage fail closed, synchronize withdrawal across tabs and checkout, revoke pending server attribution bindings, retain analytics-only source information without advertising click identifiers, and expire first/last touches independently. Existing purchase publisher ownership, callback deadlines, payment eligibility and event timestamps are preserved. The Lux Contentsquare integration retains its embedded consent guard.

## Source and validation

| Site | Production deployment |
| --- | --- |
| Arvoa Lux | `dpl_78X6Xoj7sbWXWSUfrDAKVCF2cKmZ` |
| BioBarat | `dpl_9LMWS8FjyTHiqNiekxr7DswTy67k` |

Run `node scripts/test-measurement-consent.cjs` from the repository root. The 47 offline cases read these actual checked-out files, not historical fixtures or generated patches. They use a mocked browser and make no network requests or real orders. They verify isolated script behavior; passing them does **not** verify complete application builds or checkout API compatibility.

The deployed release was separately checked against its live inline scripts. Attribution of a new real Google Ads purchase is still pending confirmation in GA4 and Google Ads.

## Integration work required before merge

- Current `main` lacks all four measurement files and the custom checkout integration; adding these files alone leaves main consent modules unused.
- This branch has the older Lux checkout integration. BioBarat still requires its production layout import, cart and checkout API routes, checkout static assets, rewrites and associated app dependencies.
- `packages/core/src/checkout.ts` here is older than production: measurement-consent receipts and publisher ownership are not forwarded correctly; attribution and revocation remain Lux-only.
- Production snapshots differ from this base in 5 added/16 changed files for the Lux app and its shared dependencies, and 113 added/50 changed files for BioBarat. There are 41 conflicting shared file versions between the two production snapshots. These include checkout, cart, catalog and presentation files. Reconcile them against both deployments or preserve separately validated release branches; do not overwrite either snapshot blindly.
- Preserve the current Lux build injector behavior: its embedded `window.__arvoaContentsquare` marker makes the pinned injector skip the already-guarded block. Re-run the injector during build verification and verify the consent guard survives.
- Before promotion, validate both full builds, API request/response contracts and checkout rendering. Then verify actual deployed scripts, primary conversion ownership and aliases. Do not fabricate ad click IDs or replay customer purchases for testing.

No production aliases, Google Ads settings, consent choices, credentials, billing or WeTracked configuration are changed by this source handoff. WeTracked Google publication remains disabled from the previous production repair. No server credentials or customer order records are included.

## Production source checksums (SHA-256)

GitHub web editing appends a final newline to the checkout HTML files. The source comparison permits only this terminal newline; inline scripts and all other bytes must match. The checksums below identify the original deployed input files.

- `apps/arvoalux/app/ga4-consent.ts`: `28948a2733b204c062399621f25d511294d1e36f92a13cd5bab0eeb186597791`
- `apps/arvoalux/public/checkout-ui/index.html`: `045366b50fb84134a329d17564df203877c6a649a5954e50115b37e77900790b`
- `apps/biobarat/app/ga4-consent.ts`: `4aba2050860e8566aa7a50f9e018de83c15f5dd79839a4cb8fd6e9fb33260e6f`
- `apps/biobarat/public/checkout-ui/index.html`: `f1be04c7b0aafb4967fa45843083519971568c3affb573c477bb09079897ebca`
