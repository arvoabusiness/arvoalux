import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

let pool: Pool | undefined;
function db(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 1, ssl: { rejectUnauthorized: false } });
  return pool;
}

function validHmac(body: Buffer, provided: string | null, secret: string): boolean {
  if (!provided) return false;
  const expected = createHmac("sha256", secret).update(body).digest("base64");
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(provided, "utf8");
  return left.length === right.length && timingSafeEqual(left, right);
}

async function ensureTable() {
  await db().query(`CREATE TABLE IF NOT EXISTS shopify_webhook_events (
    event_id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    body_sha256 TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'received',
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}

export async function POST(request: Request) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET ?? process.env.SHOPIFY_CLIENT_SECRET;
  if (!secret) return Response.json({ error: "Webhook secret is not configured" }, { status: 503 });
  const body = Buffer.from(await request.arrayBuffer());
  if (!validHmac(body, request.headers.get("x-shopify-hmac-sha256"), secret)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }
  const eventId = request.headers.get("x-shopify-event-id");
  const topic = request.headers.get("x-shopify-topic") ?? "unknown";
  if (!eventId) return Response.json({ error: "Missing event id" }, { status: 400 });
  try {
    await ensureTable();
    const result = await db().query(
      `INSERT INTO shopify_webhook_events (event_id, topic, body_sha256)
       VALUES ($1, $2, encode(digest($3, 'sha256'), 'hex'))
       ON CONFLICT (event_id) DO NOTHING
       RETURNING event_id`,
      [eventId, topic, body],
    );
    if (result.rowCount === 0) return Response.json({ accepted: true, duplicate: true, event_id: eventId });
    return Response.json({ accepted: true, duplicate: false, status: "received", event_id: eventId, topic }, { status: 202 });
  } catch {
    return Response.json({ error: "Persistent event store unavailable" }, { status: 503 });
  }
}
