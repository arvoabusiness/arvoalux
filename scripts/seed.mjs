/**
 * Seed the dev store: 9 brand smart-collections + sample products,
 * published to every sales channel (incl. the Headless storefront).
 *
 * Setup (Shopify admin → Settings → Apps and sales channels → Develop apps):
 *   create app "seed-script", Admin API scopes:
 *     read_products, write_products, read_publications, write_publications
 *   then: install app → copy Admin API access token (shpat_...)
 *
 * Run:
 *   SHOPIFY_STORE_DOMAIN=arvoalux-platform-dev.myshopify.com \
 *   SHOPIFY_ADMIN_TOKEN=shpat_xxx \
 *   node scripts/seed.mjs
 */

const STORE = process.env.SHOPIFY_STORE_DOMAIN;
const VERSION = process.env.SHOPIFY_API_VERSION ?? "2026-01";

if (!STORE || (!process.env.SHOPIFY_ADMIN_TOKEN && !(process.env.SHOPIFY_CLIENT_ID && process.env.SHOPIFY_CLIENT_SECRET))) {
  console.error(
    "Set SHOPIFY_STORE_DOMAIN plus either SHOPIFY_ADMIN_TOKEN (legacy custom app)\n" +
    "or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (Dev Dashboard app)."
  );
  process.exit(1);
}

let TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

// Dev Dashboard apps: exchange Client ID + Secret for a 24h Admin token
// (client credentials grant — app must be installed on the store and
// belong to the same organization).
async function ensureToken() {
  if (TOKEN) return;
  const url = `https://${STORE}/admin/oauth/access_token`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
    }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(
      `Token exchange returned non-JSON (HTTP ${res.status}).\n` +
      `First bytes: ${text.slice(0, 160).replace(/\s+/g, " ")}\n\n` +
      `This means the store didn't recognise the app. Checklist:\n` +
      `  1. Dev Dashboard → seed-script → Versions: release a version whose\n` +
      `     Admin scopes include read_products, write_products,\n` +
      `     read_publications, write_publications.\n` +
      `  2. Install seed-script on ${STORE} (same org as the app).\n` +
      `  3. Confirm SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET are this app's.`
    );
  }
  if (!res.ok || !json.access_token) {
    throw new Error(`Token exchange failed (HTTP ${res.status}): ${JSON.stringify(json)}`);
  }
  TOKEN = json.access_token;
  console.log(`Got Admin token via client credentials (scopes: ${json.scope})\n`);
}

const BRANDS = [
  "arvoalux", "biobarat", "boltbio", "nagykervitamin", "napivitamin",
  "nutrimarket", "prevenciobolt", "provitaminok", "unipatikatt",
];

// Sample catalog. `brands` shows both exclusive and shared products —
// the same physical product can be sold on several storefronts.
const PRODUCTS = [
  { title: "D3-vitamin 4000 NE (90 kapszula)", price: "3490", brands: ["arvoalux", "biobarat", "napivitamin"] },
  { title: "C-vitamin 1000 mg retard (100 db)", price: "2990", brands: ["boltbio", "nagykervitamin", "nutrimarket"] },
  { title: "Omega-3 halolaj 1000 mg (60 kapszula)", price: "4590", brands: ["arvoalux", "prevenciobolt"] },
  { title: "Magnézium-citrát + B6 (90 tabletta)", price: "3290", brands: ["napivitamin", "provitaminok", "unipatikatt"] },
  { title: "Cink-pikolinát 25 mg (60 kapszula)", price: "2490", brands: ["biobarat", "boltbio"] },
  { title: "Probiotikum 10 mrd CFU (30 kapszula)", price: "5990", brands: ["arvoalux", "unipatikatt"] },
  { title: "K2+D3 vitamin csepp (20 ml)", price: "4990", brands: ["arvoalux", "napivitamin"] },
  { title: "Kollagén peptid por (300 g)", price: "7990", brands: ["arvoalux"] },
  { title: "B-komplex forte (100 tabletta)", price: "2790", brands: ["nagykervitamin", "nutrimarket"] },
  { title: "Q10 koenzim 100 mg (60 kapszula)", price: "6490", brands: ["prevenciobolt", "provitaminok"] },
  { title: "Vas-biszglicinát 20 mg (90 kapszula)", price: "3190", brands: ["unipatikatt", "boltbio"] },
  { title: "Multivitamin família (120 tabletta)", price: "5490", brands: ["nutrimarket", "nagykervitamin", "napivitamin"] },
];

async function gql(query, variables = {}) {
  const res = await fetch(`https://${STORE}/admin/api/${VERSION}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Admin API returned non-JSON (HTTP ${res.status}): ${text.slice(0, 160)}`);
  }
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

function logErrors(label, userErrors) {
  if (userErrors?.length) console.warn(`  ! ${label}:`, userErrors.map((e) => e.message).join("; "));
  return !userErrors?.length;
}

async function getPublications() {
  const data = await gql(`{ publications(first: 20) { nodes { id name } } }`);
  return data.publications.nodes;
}

async function publish(id, publications) {
  const data = await gql(
    `mutation($id: ID!, $input: [PublicationInput!]!) {
       publishablePublish(id: $id, input: $input) { userErrors { field message } }
     }`,
    { id, input: publications.map((p) => ({ publicationId: p.id })) }
  );
  logErrors("publish", data.publishablePublish.userErrors);
}

async function ensureCollection(handle, tag, publications) {
  const existing = await gql(
    `query($q: String!) { collections(first: 1, query: $q) { nodes { id handle } } }`,
    { q: `handle:${handle}` }
  );
  if (existing.collections.nodes.length) {
    console.log(`= collection exists: ${handle}`);
    return existing.collections.nodes[0].id;
  }
  const data = await gql(
    `mutation($input: CollectionInput!) {
       collectionCreate(input: $input) {
         collection { id handle }
         userErrors { field message }
       }
     }`,
    {
      input: {
        title: handle.replace("brand-", "").toUpperCase() + " (brand)",
        handle,
        ruleSet: {
          appliedDisjunctively: false,
          rules: [{ column: "TAG", relation: "EQUALS", condition: tag }],
        },
      },
    }
  );
  if (!logErrors("collectionCreate", data.collectionCreate.userErrors)) return null;
  const id = data.collectionCreate.collection.id;
  await publish(id, publications);
  console.log(`+ collection created: ${handle}`);
  return id;
}

async function ensureProduct(p, publications) {
  const existing = await gql(
    `query($q: String!) { products(first: 1, query: $q) { nodes { id title } } }`,
    { q: `title:'${p.title.replace(/'/g, "\\'")}'` }
  );
  if (existing.products.nodes.length) {
    console.log(`= product exists: ${p.title}`);
    return;
  }
  const data = await gql(
    `mutation($input: ProductSetInput!) {
       productSet(synchronous: true, input: $input) {
         product { id title }
         userErrors { field message }
       }
     }`,
    {
      input: {
        title: p.title,
        status: "ACTIVE",
        vendor: "Arvoalux Group",
        descriptionHtml: `<p>Minőségi étrend-kiegészítő. (Teszt termék — seed script.)</p>`,
        tags: p.brands.map((b) => `brand:${b}`),
        productOptions: [{ name: "Title", values: [{ name: "Default Title" }] }],
        variants: [
          {
            optionValues: [{ optionName: "Title", name: "Default Title" }],
            price: p.price,
          },
        ],
      },
    }
  );
  if (!logErrors("productSet", data.productSet.userErrors)) return;
  await publish(data.productSet.product.id, publications);
  console.log(`+ product created: ${p.title} [${p.brands.join(", ")}]`);
}

async function main() {
  console.log(`Seeding ${STORE} (API ${VERSION})\n`);

  await ensureToken();

  const publications = await getPublications();
  console.log(`Publishing to channels: ${publications.map((p) => p.name).join(", ")}\n`);

  for (const b of BRANDS) {
    await ensureCollection(`brand-${b}`, `brand:${b}`, publications);
  }
  console.log("");
  for (const p of PRODUCTS) {
    await ensureProduct(p, publications);
  }

  console.log("\nDone. Open the app and check each brand's homepage.");
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
