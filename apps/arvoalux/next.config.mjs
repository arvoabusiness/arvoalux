import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// Production publication is explicitly opt-in; commerce remains pinned off below.
if ((process.env.VERCEL_ENV === 'production' || process.env.VERCEL_TARGET_ENV === 'production') && process.env.ARVOALUX_BROWSING_RELEASE !== '1') throw new Error('Lux production requires browsing-only release opt-in');
const maintenanceSha256 = '2a462c4a09a1bbdf8a064fa3947f7336fe4058b6618b404eb1ec0936b15ee25d';
const middlewareSha256 = createHash('sha256')
  .update(readFileSync(new URL('./middleware.ts', import.meta.url)))
  .digest('hex');
if (middlewareSha256 !== maintenanceSha256) {
  throw new Error('Commerce candidate: immutable request boundary required');
}
const nextConfig = {
serverExternalPackages:["ssh2"],
  async rewrites(){return {beforeFiles:[{source:"/checkout",destination:"/checkout-ui/index.html"}]};},
  experimental: { cpus: 1 },
  transpilePackages: ['@arvoalux/core'],
  env: { NEXT_PUBLIC_ARVOA_COMMERCE: '1', STOREFRONT_APP_BRAND: 'arvoalux', SHOPIFY_CATALOG_CHANNEL: 'storefront-public-read', NEXT_PUBLIC_ARVOALUX_REVIEW_ONLY: '0', NEXT_PUBLIC_ARVOALUX_PUBLIC_BROWSING: '1', NEXT_PUBLIC_ARVOALUX_COMMERCE: '1', SHOPIFY_STORE_DOMAIN: 'arvoalux.myshopify.com', SHOPIFY_STOREFRONT_API_VERSION: '2026-07' },
  async headers() { return [{ source: '/:path*', headers: [
    { key: 'X-Arvoa-Release', value: 'private-cumulative-candidate-v1' },
  ] }]; },
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};
export default nextConfig;
