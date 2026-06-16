/**
 * Scaffold a new brand app: npm run new-brand -- <handle> "Display Name"
 * Creates apps/<handle> with the thin boilerplate + a starter brand.config.ts.
 * Edit the generated brand.config.ts to set the theme, domains, and tagline.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const [, , handle, displayName] = process.argv;
if (!handle) {
  console.error('Usage: npm run new-brand -- <handle> "Display Name"');
  process.exit(1);
}
const name = displayName ?? handle;
const root = join(process.cwd(), "apps", handle);
if (existsSync(root)) {
  console.error(`apps/${handle} already exists.`);
  process.exit(1);
}

const dirs = ["app/products/[handle]", "app/cart"];
dirs.forEach((d) => mkdirSync(join(root, d), { recursive: true }));

const f = (rel, content) => writeFileSync(join(root, rel), content);

f("package.json", JSON.stringify({
  name: `@arvoalux/brand-${handle}`,
  private: true, version: "0.1.0",
  scripts: {
    dev: 'NODE_OPTIONS="--no-network-family-autoselection" next dev',
    build: 'NODE_OPTIONS="--no-network-family-autoselection" next build',
    start: 'NODE_OPTIONS="--no-network-family-autoselection" next start',
  },
  dependencies: { "@arvoalux/core": "*", next: "^15.3.0", react: "^19.0.0", "react-dom": "^19.0.0" },
  devDependencies: { "@types/node": "^22.0.0", "@types/react": "^19.0.0", typescript: "^5.6.0" },
}, null, 2) + "\n");

f("next.config.mjs", `const nextConfig = { transpilePackages: ["@arvoalux/core"] };\nexport default nextConfig;\n`);
f("tsconfig.json", JSON.stringify({
  extends: "../../tsconfig.base.json",
  compilerOptions: { plugins: [{ name: "next" }], paths: { "@/*": ["./*"] } },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  exclude: ["node_modules"],
}, null, 2) + "\n");
f("next-env.d.ts", `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n`);
f(".env.example", `SHOPIFY_STORE_DOMAIN=arvoalux-platform-dev.myshopify.com\nSHOPIFY_API_VERSION=2026-01\nSHOPIFY_PRIVATE_TOKEN=\n`);

f("app/layout.tsx", `import { BrandLayout } from "@arvoalux/core";\nimport "@arvoalux/core/styles.css";\nimport { brand } from "@/brand.config";\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return <BrandLayout brand={brand}>{children}</BrandLayout>;\n}\n`);
f("app/page.tsx", `import { HomePage } from "@arvoalux/core";\nimport { brand } from "@/brand.config";\n\nexport const dynamic = "force-dynamic";\n\nexport default function Page() {\n  return <HomePage brand={brand} />;\n}\n`);
f("app/products/[handle]/page.tsx", `import { ProductPage } from "@arvoalux/core";\nimport { brand } from "@/brand.config";\n\nexport const dynamic = "force-dynamic";\n\nexport default async function Page({ params }: { params: Promise<{ handle: string }> }) {\n  const { handle } = await params;\n  return <ProductPage brand={brand} handle={handle} />;\n}\n`);
f("app/cart/page.tsx", `import { CartPage } from "@arvoalux/core";\nimport { brand } from "@/brand.config";\n\nexport const dynamic = "force-dynamic";\n\nexport default function Page() {\n  return <CartPage brand={brand} />;\n}\n`);

f("brand.config.ts", `import { defineBrand } from "@arvoalux/core";\n\nexport const brand = defineBrand({\n  handle: "${handle}",\n  name: "${name}",\n  tagline: "TODO: tagline",\n  domains: ["${handle}.example.com"],\n  collectionHandle: "brand-${handle}",\n  theme: {\n    bg: "#ffffff", surface: "#f5f5f5", fg: "#161616", muted: "#6b6b6b",\n    accent: "#2f7d32", accentFg: "#ffffff", radius: "10px",\n    fontHref: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap",\n    fontDisplay: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",\n  },\n});\n`);

console.log(`Created apps/${handle}. Next:\n  1. Edit apps/${handle}/brand.config.ts (theme, domains, tagline)\n  2. cp apps/${handle}/.env.example apps/${handle}/.env and add the token\n  3. npm install\n  4. npm run dev -w @arvoalux/brand-${handle}`);
