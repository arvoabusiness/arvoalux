export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    service: "arvoalux-webhook-gateway",
    status: "ok",
    webhook_hmac_configured: Boolean(
      process.env.SHOPIFY_WEBHOOK_SECRET ?? process.env.SHOPIFY_CLIENT_SECRET,
    ),
    idempotency_store_configured: Boolean(process.env.DATABASE_URL),
  });
}
