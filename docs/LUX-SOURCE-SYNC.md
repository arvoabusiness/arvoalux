# ArvoaLux source reconciliation

This branch reconciles the ArvoaLux app and shared core with production Vercel source `dpl_653irFbejUzPk6MYLjhtmTYa6fWb` (2026-10-22). The other eight application directories are preserved; they are not asserted to match their separate live deployments. Shared-core changes require brand regression review before a portfolio-wide production release.

Run `npm ci`, then `node scripts/integrate-contentsquare.cjs`, then `npm run build -w @arvoalux/brand-arvoalux`. The integration is idempotent. It preserves the existing consent-gated GA4, Clarity and Contentsquare code. Production browsing opt-in and immutable middleware guards remain enforced.

Five large category PNGs are stored losslessly in `scripts/source-assets/` because the repository API adapter limits each request. The prebuild script restores them and checks exact byte counts and SHA-256 hashes before building; generated outputs are ignored. No conversion or pixel changes are performed. CLI uploads containing full assets work without the manifest.

Do not replace another storefront with this Lux snapshot, copy credentials into Git, or merge/deploy without checking current live baselines. The PR preview and the current production deployment are separate.
