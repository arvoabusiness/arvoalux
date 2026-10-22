import type { Brand } from "../../types";
import {
  storefront,
  BRAND_PRODUCTS_QUERY,
  ALL_PRODUCTS_QUERY,
  PRODUCT_QUERY,
  cacheTags,
  type ProductCard as ProductCardData,
} from "../../shopify";
import { PaginatedProductGrid } from "../product/PaginatedProductGrid";
import { SectionHeading } from "./SectionHeading";

// Products shown per page in the Featured grid.
const PAGE_SIZE = 12;
// Pool fetched up front so pagination has multiple pages to move through.
const POOL_SIZE = 48;

const FEATURED_HEROES = [
  {
    "id": "gid://shopify/Product/15621211324799",
    "handle": "szent-gyorgyi-albert-cedezin-forte-szelen-tabletta-60x"
  },
  {
    "id": "gid://shopify/Product/15621212275071",
    "handle": "goodwill-makula-komplex-areds2-formula-60x-3047"
  },
  {
    "id": "gid://shopify/Product/15621211816319",
    "handle": "cartinorm-d3-filmtabletta-60x-3017"
  },
  {
    "id": "gid://shopify/Product/15621211390335",
    "handle": "gelsectan-kapszula-30x-2991"
  },
  {
    "id": "gid://shopify/Product/15621212078463",
    "handle": "goodwill-japonica-femina-tabletta-60x-3035"
  },
  {
    "id": "gid://shopify/Product/15621212307839",
    "handle": "goodwill-nephroxon-60x-3052"
  },
  {
    "id": "gid://shopify/Product/15621212340607",
    "handle": "goodwill-profertil-kapszula-60x-3053"
  },
  {
    "id": "gid://shopify/Product/15621212569983",
    "handle": "goodwill-zekron-tabletta-60x-3070"
  },
  {
    "id": "gid://shopify/Product/15621212930431",
    "handle": "goodwill-cartinorm-injekcio-20mg2ml-1x-3092"
  },
  {
    "id": "gid://shopify/Product/15621212963199",
    "handle": "goodwill-cartinorm-extra-injekcio-30mg2ml-1x-3094"
  },
  {
    "id": "gid://shopify/Product/15621212995967",
    "handle": "goodwill-cartinorm-xl-chondro-injekcio-3ml-1x-3095"
  },
  {
    "id": "gid://shopify/Product/15621213028735",
    "handle": "goodwill-cartinorm-xl-forte-injekcio-75mg3ml-1x-3098"
  },
  {
    "id": "gid://shopify/Product/15621213061503",
    "handle": "goodwill-cartinorm-xl-trio-injekcio-225ml-1x-3101"
  },
  {
    "id": "gid://shopify/Product/15621218369919",
    "handle": "goodwill-cartinorm-max-injekcio-80mg4ml-4596"
  }
];

export async function FeaturedProductsSection({ brand }: { brand: Brand }) {
  let products: ProductCardData[] = [];
  try {
    if (brand.handle === "arvoalux") {
      const selected = await Promise.all(FEATURED_HEROES.map(async ({ id, handle }) => {
        const data = await storefront<{ product: Omit<ProductCardData, "handle"> | null }>(
          brand.handle, PRODUCT_QUERY, { handle },
          { tags: [cacheTags.brand(brand.handle), cacheTags.product(handle)] }
        );
        const product = data.product;
        return product && product.id === id && product.featuredImage
          ? { ...product, handle } as ProductCardData : null;
      }));
      products = selected.filter((product): product is ProductCardData => product !== null);
    } else {
    const data = await storefront<{ collection: { products: { nodes: ProductCardData[] } } | null }>(
      brand.handle,
      BRAND_PRODUCTS_QUERY,
      { collection: brand.collectionHandle, first: POOL_SIZE },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    products = data.collection?.products.nodes ?? [];

    // Fallback: real stores may lack the `brand-<handle>` automated collection,
    // so pull the newest products instead of letting the section vanish.
    if (products.length === 0) {
      const all = await storefront<{ products: { nodes: ProductCardData[] } }>(
        brand.handle,
        ALL_PRODUCTS_QUERY,
        { first: POOL_SIZE },
        { tags: [cacheTags.brand(brand.handle)] }
      );
      products = all.products.nodes;
    }
    }
  } catch {
    products = [];
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white" data-testid="featured-products-section">
      <div className="max-w-7xl mx-auto px-4">
        <SectionHeading title="Kiemelt termékek" ctaLabel="Összes termék" ctaHref={`/collections/${brand.collectionHandle}`} />
        <PaginatedProductGrid products={products} brandHandle={brand.handle} pageSize={PAGE_SIZE} />
      </div>
    </section>
  );
}
