export type HeroSlot =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-wide"
  | "bottom-small-1"
  | "bottom-small-2"
  | "bottom-small-3";

export type HeroBannerConfig = {
  id: string;
  slot: HeroSlot;
  type: "product";
  productHandle: string;
  fallbackCollectionHandle: string;
  bgColor: string;
  accentColor: string;
  imageScale?: "normal" | "large" | "xlarge";
  isPrimary?: boolean;
};

export type HeroProductData = {
  id: string;
  handle: string;
  title: string;
  vendor: string | null;
  availableForSale: boolean;
  featuredImage: { url: string; altText: string | null } | null;
};

export type HeroCollectionData = {
  id: string;
  handle: string;
  title: string;
  image: { url: string; altText: string | null } | null;
};

export type HeroBannerItem = {
  id: string;
  slot: HeroSlot;
  type: "product" | "collection";
  productHandle?: string;
  collectionHandle?: string;
  productId?: string;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  mobileCta: string;
  image?: string;
  imageAlt: string;
  bgColor: string;
  accentColor: string;
  imageScale?: "normal" | "large" | "xlarge";
  isPrimary?: boolean;
  brandHandle?: string;
};

const heroBrandNames = {
  arvoalux: "Arvoalux",
  biobarat: "BioBarát",
  boltbio: "BoltBio",
  nagykervitamin: "Nagy Kervitamin",
  napivitamin: "Napi Vitamin",
  nutrimarket: "NutriMarket",
  prevenciobolt: "Prevenciobolt",
  provitaminok: "ProVitaminok",
  vitaminbolt: "VitaminBolt",
} as const;

export const heroBrandHandles = Object.freeze(Object.keys(heroBrandNames));

const heroBannerConfigs: readonly HeroBannerConfig[] = Object.freeze([
  {
    id: "organic-magnesium",
    slot: "top-left",
    type: "product",
    productHandle: "jutavit-szerves-magnezium-b6-d3-70x-2455",
    fallbackCollectionHandle: "magnezium",
    bgColor: "#e8ede5",
    accentColor: "#315542",
  },
  {
    id: "adult-multivitamin",
    slot: "top-center",
    type: "product",
    productHandle: "jutavit-multivitamin-felnotteknek-filmtabletta-45x-1277",
    fallbackCollectionHandle: "multivitaminok",
    bgColor: "#f4eddd",
    accentColor: "#725d25",
    isPrimary: true,
  },
  {
    id: "omega-three",
    slot: "top-right",
    type: "product",
    productHandle: "jutavit-omega-3-1200mg-e-vitamin-kapszula-100x-1282",
    fallbackCollectionHandle: "omega-3-halolaj",
    bgColor: "#e5ece9",
    accentColor: "#315542",
    imageScale: "large",
  },
  {
    id: "c-vitamin",
    slot: "bottom-wide",
    type: "product",
    productHandle: "jutavit-c-vitamin-1000-mg-nyujtott-kioldodasu-csipkebogyo-d3-vitamin-cink-100-db-1229",
    fallbackCollectionHandle: "c-vitamin",
    bgColor: "#f4eadc",
    accentColor: "#8a6330",
  },
  {
    id: "d-three-vitamin",
    slot: "bottom-small-1",
    type: "product",
    productHandle: "jutavit-d3-vitamin-4000ne-forte-tabletta-100x-1238",
    fallbackCollectionHandle: "d-vitamin",
    bgColor: "#eee8d8",
    accentColor: "#725d25",
  },
  {
    id: "vegan-probiotics",
    slot: "bottom-small-2",
    type: "product",
    productHandle: "your-vitamin-healthy-life-probiotics-vegan-4776",
    fallbackCollectionHandle: "vitaminok",
    bgColor: "#e7ede3",
    accentColor: "#315542",
    imageScale: "xlarge",
  },
  {
    id: "collagen-complex",
    slot: "bottom-small-3",
    type: "product",
    productHandle: "jutavit-kollagen-komplex-60x-2457",
    fallbackCollectionHandle: "kollagen",
    bgColor: "#f1e8e1",
    accentColor: "#76594f",
  },
]);

export function getHeroBannerConfigs(handle: string): readonly HeroBannerConfig[] {
  return handle in heroBrandNames ? heroBannerConfigs : [];
}

export function resolveHeroBanners(
  handle: string,
  products: readonly HeroProductData[],
  collections: readonly HeroCollectionData[],
): readonly HeroBannerItem[] {
  const productsByHandle = new Map(products.map((product) => [product.handle, product]));
  const collectionsByHandle = new Map(collections.map((collection) => [collection.handle, collection]));

  return getHeroBannerConfigs(handle).flatMap((config): HeroBannerItem[] => {
    const product = productsByHandle.get(config.productHandle);
    if (product?.availableForSale && product.featuredImage?.url) {
      return [{
        id: config.id,
        slot: config.slot,
        type: "product" as const,
        productHandle: product.handle,
        productId: product.id,
        title: product.title,
        subtitle: product.vendor ?? heroBrandNames[handle as keyof typeof heroBrandNames],
        href: `/products/${product.handle}`,
        cta: "Megnézem",
        mobileCta: "Megnézem",
        image: product.featuredImage.url,
        imageAlt: product.featuredImage.altText ?? product.title,
        bgColor: config.bgColor,
        accentColor: config.accentColor,
        imageScale: config.imageScale,
        isPrimary: config.isPrimary,
        brandHandle: handle,
      }];
    }

    const collection = collectionsByHandle.get(config.fallbackCollectionHandle);
    if (!collection) return [];
    return [{
      id: config.id,
      slot: config.slot,
      type: "collection" as const,
      collectionHandle: collection.handle,
      title: collection.title,
      subtitle: heroBrandNames[handle as keyof typeof heroBrandNames],
      href: `/collections/${collection.handle}`,
      cta: "Kategória megtekintése",
      mobileCta: "Kategória",
      image: collection.image?.url,
      imageAlt: collection.image?.altText ?? collection.title,
      bgColor: config.bgColor,
      accentColor: config.accentColor,
      imageScale: config.imageScale,
      isPrimary: config.isPrimary,
      brandHandle: handle,
    }];
  });
}
