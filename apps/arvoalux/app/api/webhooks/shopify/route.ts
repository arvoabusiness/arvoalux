import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";

export const dynamic = "force-dynamic";
let pool: Pool | undefined;
function db(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  return pool;
}
function validHmac(body: Buffer, provided: string | null, secret: string): boolean {
  if (!provided) return false;
  const expected = createHmac("sha256", secret).update(body).digest("base64");
  const left = Buffer.from(expected); const right = Buffer.from(provided);
  return left.length === right.length && timingSafeEqual(left, right);
}
async function ensureTable() {
  await db().query(`CREATE TABLE IF NOT EXISTS shopify_webhook_events (
    event_id TEXT PRIMARY KEY, topic TEXT NOT NULL, body_sha256 TEXT NOT NULL,
    body_json JSONB, order_id TEXT, status TEXT NOT NULL DEFAULT 'received',
    attempts INTEGER NOT NULL DEFAULT 0, next_retry_at TIMESTAMPTZ,
    last_error TEXT, received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
  )`);
  for (const sql of [
    "ALTER TABLE shopify_webhook_events ADD COLUMN IF NOT EXISTS body_json JSONB",
    "ALTER TABLE shopify_webhook_events ADD COLUMN IF NOT EXISTS order_id TEXT",
    "ALTER TABLE shopify_webhook_events ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE shopify_webhook_events ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ",
    "ALTER TABLE shopify_webhook_events ADD COLUMN IF NOT EXISTS last_error TEXT",
    "ALTER TABLE shopify_webhook_events ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ",
  ]) await db().query(sql);
}
function orderId(payload: Record<string, unknown>): string | null {
  const id = payload.id ?? payload.admin_graphql_api_id;
  return id === undefined || id === null ? null : String(id);
}
function statusFor(topic: string, payload: Record<string, unknown>): string {
  if (topic === "ORDERS_CREATE") return orderId(payload) ? "pending_zoho_approval" : "dead_letter";
  if (topic === "ORDERS_CANCELLED") return orderId(payload) ? "pending_reconciliation" : "dead_letter";
  return "received";
}
async function writeAirtableEvent(eventId: string, topic: string, orderId: string | null, status: string, bodySha256: string) {
  const token = process.env.AIRTABLE_API_KEY;
  const base = process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_EVENTS_TABLE_ID;
  if (!token || !base || !table) return false;
  const response = await fetch(`https://api.airtable.com/v0/${base}/${table}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: {
      "Event ID": eventId, Provider: "shopify", Topic: topic, "External ID": orderId ?? "",
      Status: status, "Payload Hash": bodySha256, "Received At": new Date().toISOString(), Error: ""
    }}),
  });
  return response.ok;
}

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET ?? process.env.SHOPIFY_CLIENT_SECRET;
  if (!secret) return Response.json({ error: "Webhook secret is not configured" }, { status: 503 });
  const body = Buffer.from(await request.arrayBuffer());
  if (!validHmac(body, request.headers.get("x-shopify-hmac-sha256"), secret)) return Response.json({ error: "Invalid signature" }, { status: 401 });
  const eventId = request.headers.get("x-shopify-event-id");
  const topic = request.headers.get("x-shopify-topic") ?? "unknown";
  if (!eventId) return Response.json({ error: "Missing event id" }, { status: 400 });
  let payload: Record<string, unknown>;
  try { payload = JSON.parse(body.toString("utf8")) as Record<string, unknown>; }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  try {
    await ensureTable();
    const bodySha256 = createHash("sha256").update(body).digest("hex");
    const status = statusFor(topic, payload); const oid = orderId(payload);
    const result = await db().query(
      `INSERT INTO shopify_webhook_events (event_id, topic, body_sha256, body_json, order_id, status)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6) ON CONFLICT (event_id) DO NOTHING RETURNING event_id, status`,
      [eventId, topic, bodySha256, JSON.stringify(payload), oid, status],
    );
    if (result.rowCount === 0) return Response.json({ accepted: true, duplicate: true, event_id: eventId });
    try { await writeAirtableEvent(eventId, topic, oid, status, bodySha256); } catch (error) { console.error("AIRTABLE_AUDIT_ERROR", error instanceof Error ? error.message.slice(0, 160) : "unknown"); }
    if (status === "dead_letter") return Response.json({ accepted: true, status, event_id: eventId }, { status: 202 });
    return Response.json({ accepted: true, duplicate: false, status, event_id: eventId, topic, order_id: oid }, { status: 202 });
  } catch (error) {
    console.error("WEBHOOK_DB_ERROR", { name: error instanceof Error ? error.name : "UnknownError", message: error instanceof Error ? error.message.slice(0, 180) : "Unknown database error" });
    return Response.json({ error: "Persistent event store unavailable" }, { status: 503 });
  }
}
