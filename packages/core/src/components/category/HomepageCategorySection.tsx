import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import type { Brand } from "../../types";
import {
  storefront,
  COLLECTIONS_QUERY,
  cacheTags,
  visibleCollections,
  type CollectionSummary,
} from "../../shopify";

export async function HomepageCategorySection({ brand }: { brand: Brand }) {
  let collections: CollectionSummary[] = [];
  try {
    const data = await storefront<{ collections: { nodes: CollectionSummary[] } }>(
      brand.handle,
      COLLECTIONS_QUERY,
      { first: 50 },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    collections = visibleCollections(data.collections.nodes);
  } catch {
    collections = [];
  }

  if (collections.length === 0) return null;

  return (
    <section className="py-10 bg-white" data-testid="homepage-category-section">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 md:mb-8 tracking-tight text-center sm:text-left">
          Vásárlás kategória szerint
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.handle}`}
              className="flex items-center gap-3 border border-gray-100 rounded-brand bg-[#fafafa] hover:border-gray-300 active:bg-gray-50 transition-colors px-3 sm:px-4 py-3 sm:py-4"
              data-testid={`homepage-cat-${col.handle}`}
            >
              {col.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={col.image.url}
                  alt={col.image.altText ?? col.title}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                />
              ) : (
                <span className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                </span>
              )}
              <span className="flex-1 font-bold text-[13px] sm:text-sm text-gray-900 leading-tight min-w-0">
                {col.title}
              </span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
