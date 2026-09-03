import { handleShopifyRevalidate } from "@arvoalux/core";

// Shopify webhook → purge this brand's cached catalog reads. See core/revalidate.ts.
export async function POST(request: Request) {
  return handleShopifyRevalidate(request);
}
