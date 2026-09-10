import "server-only";
import { cacheTags, storefront } from "../../shopify";
import {
  getHeroBannerConfigs,
  resolveHeroBanners,
  type HeroBannerItem,
  type HeroCollectionData,
  type HeroProductData,
} from "./heroCampaigns";

const PRODUCT_FIELDS = `
  id
  handle
  title
  vendor
  availableForSale
  featuredImage { url(transform: { maxWidth: 900 }) altText }
`;

const COLLECTION_FIELDS = `
  id
  handle
  title
  image { url(transform: { maxWidth: 900 }) altText }
`;

type HeroQueryData = Record<string, HeroProductData | HeroCollectionData | null>;

function buildHeroQuery(count: number): string {
  const variables = Array.from({ length: count }, (_, index) => `$product${index}: String!, $collection${index}: String!`).join(", ");
  const fields = Array.from({ length: count }, (_, index) => `
    product${index}: product(handle: $product${index}) { ${PRODUCT_FIELDS} }
    collection${index}: collection(handle: $collection${index}) { ${COLLECTION_FIELDS} }
  `).join("\n");
  return `query HeroData(${variables}) { ${fields} }`;
}

export async function loadHeroBanners(brandHandle: string): Promise<readonly HeroBannerItem[]> {
  const configs = getHeroBannerConfigs(brandHandle);
  if (configs.length !== 7) return [];

  const variables = Object.fromEntries(configs.flatMap((config, index) => [
    [`product${index}`, config.productHandle],
    [`collection${index}`, config.fallbackCollectionHandle],
  ]));

  try {
    const data = await storefront<HeroQueryData>(
      brandHandle,
      buildHeroQuery(configs.length),
      variables,
      { revalidate: 300, tags: [cacheTags.brand(brandHandle)] },
    );
    const products = configs.flatMap((_, index) => {
      const product = data[`product${index}`];
      return product && "availableForSale" in product ? [product] : [];
    });
    const collections = configs.flatMap((_, index) => {
      const collection = data[`collection${index}`];
      return collection && !("availableForSale" in collection) ? [collection] : [];
    });
    const resolved = resolveHeroBanners(brandHandle, products, collections);
    return resolved.length === 7 ? resolved : [];
  } catch {
    return [];
  }
}
