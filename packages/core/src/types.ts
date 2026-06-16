export type BrandTheme = {
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  accent: string;
  accentFg: string;
  radius: string;
  fontHref: string;
  fontDisplay: string;
  fontBody: string;
};

export type Brand = {
  handle: string; // internal id; matches the product tag brand:<handle>
  name: string;
  tagline: string;
  domains: string[];
  collectionHandle: string; // Shopify automated collection: brand-<handle>
  theme: BrandTheme;
};

/** Small helper so a brand app can define its config with full type-checking. */
export function defineBrand(brand: Brand): Brand {
  return brand;
}
