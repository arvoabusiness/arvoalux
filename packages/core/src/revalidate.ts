import "server-only";
import { revalidateTag } from "next/cache";
import { cacheTags } from "./shopify";

/**
 * Webhook target that purges cached catalog reads on demand.
 *
 * Wire a Shopify webhook (products/update, products/delete, collections/update)
 * to each app's `/api/revalidate` route, which just calls this. When a product
 * changes in Shopify the affected brand storefront refreshes within seconds —
 * no need to render every page on every request, which is what protects the
 * Basic plan's Storefront API limits.
 *
 * Auth: set SHOPIFY_REVALIDATION_SECRET in the app env and send it either as
 * the `x-revalidation-secret` header or a `?secret=` query param.
 *
 * Tags purged:
 *   - product:<handle>      (from the webhook payload's `handle`)
 *   - brand:<handle>        (from each `brand:<handle>` product tag)
 *   - any explicit `?tag=`  (for manual / scripted invalidation)
 */
export async function handleShopifyRevalidate(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const secret = process.env.SHOPIFY_REVALIDATION_SECRET;
  const provided =
    request.headers.get("x-revalidation-secret") ?? url.searchParams.get("secret");
  if (secret && provided !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    /* manual ping with no body is fine */
  }

  const tags = new Set<string>();

  if (typeof body.handle === "string") tags.add(cacheTags.product(body.handle));

  // Shopify REST webhooks send `tags` as a comma-separated string; Admin GraphQL
  // sends an array. Handle both.
  const raw = body.tags;
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : [];
  for (const t of list) {
    const tag = String(t).trim();
    if (tag.startsWith("brand:")) tags.add(tag);
  }

  for (const t of url.searchParams.getAll("tag")) tags.add(t);

  for (const tag of tags) revalidateTag(tag);

  return Response.json({ revalidated: [...tags] });
}
