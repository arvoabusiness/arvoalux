/**
 * Diagnose Storefront API connectivity for one brand app.
 *   node --env-file=apps/arvoalux/.env scripts/diag.mjs brand-arvoalux
 */
const STORE = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_PRIVATE_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-01";
const collection = process.argv[2] ?? "brand-arvoalux";

console.log("STORE   :", JSON.stringify(STORE));
console.log("VERSION :", VERSION);
console.log("TOKEN   :", TOKEN ? `${TOKEN.slice(0, 10)}… (len ${TOKEN.length})` : "(missing)");

if (!STORE || !TOKEN) {
  console.error("\n✗ Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_PRIVATE_TOKEN in this .env");
  process.exit(1);
}
if (/^https?:\/\//.test(STORE) || STORE.includes("/")) {
  console.error("\n✗ SHOPIFY_STORE_DOMAIN must be just the host, e.g. arvoalux-platform-dev.myshopify.com (no https://, no trailing slash)");
  process.exit(1);
}

const url = `https://${STORE}/api/${VERSION}/graphql.json`;
console.log("URL     :", url, "\n");

try {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Shopify-Storefront-Private-Token": TOKEN,
    },
    body: JSON.stringify({
      query: `query($c:String!){ collection(handle:$c){ title products(first:3){ nodes{ title } } } }`,
      variables: { c: collection },
    }),
  });
  console.log("HTTP    :", res.status, res.statusText);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { console.log("Body    :", text.slice(0, 300)); process.exit(1); }
  if (json.errors) { console.log("Errors  :", JSON.stringify(json.errors, null, 2)); process.exit(1); }
  const c = json.data?.collection;
  if (!c) { console.log(`\n✗ Collection "${collection}" not found / not published to this Headless storefront.`); process.exit(1); }
  console.log(`\n✓ OK — "${c.title}" returned ${c.products.nodes.length} products:`);
  c.products.nodes.forEach((p) => console.log("   -", p.title));
} catch (e) {
  console.error("\n✗ fetch failed:", e.message);
  if (e.cause) {
    console.error("  cause       :", e.cause.message ?? e.cause);
    console.error("  code        :", e.cause.code);
    console.error("  errno       :", e.cause.errno);
    console.error("  syscall     :", e.cause.syscall);
    console.error("  full cause  :", JSON.stringify(e.cause, Object.getOwnPropertyNames(e.cause)));
  }
}
