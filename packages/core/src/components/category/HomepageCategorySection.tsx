import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import type { Brand } from "../../types";
import {
  storefront,
  COLLECTIONS_QUERY,
  cacheTags,
  visibleCollections,
  buildCategoryTree,
  type CollectionSummary,
  type CategoryNode,
  type RawCollectionNode,
} from "../../shopify";

export async function HomepageCategorySection({ brand }: { brand: Brand }) {
  let collections: CollectionSummary[] = [];
  try {
    const data = await storefront<{ collections: { nodes: RawCollectionNode[] } }>(
      brand.handle,
      COLLECTIONS_QUERY,
      { first: 250 },
      { tags: [cacheTags.brand(brand.handle)] }
    );
    collections = visibleCollections(data.collections.nodes);
  } catch {
    collections = [];
  }

  if (collections.length === 0) return null;

  const tree: CategoryNode[] = buildCategoryTree(collections);

  return (
    <section className="py-10 bg-white" data-testid="homepage-category-section">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6 md:mb-8 tracking-tight text-center sm:text-left">
          Vásárlás kategória szerint
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tree.map((cat) => (
            <div
              key={cat.id}
              className="border border-gray-100 rounded-brand bg-[#fafafa] p-4"
              data-testid={`homepage-cat-${cat.handle}`}
            >
              <Link
                href={`/collections/${cat.handle}`}
                className="flex items-center gap-3 group"
              >
                {cat.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.image.url}
                    alt={cat.image.altText ?? cat.title}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  </span>
                )}
                <span className="flex-1 font-bold text-sm text-gray-900 leading-tight min-w-0 group-hover:text-brand transition-colors">
                  {cat.title}
                </span>
                <ChevronRight className="w-5 h-5 text-brand flex-shrink-0" />
              </Link>

              {cat.children.length > 0 && (
                <ul className="mt-3 pl-12 space-y-1.5">
                  {cat.children.slice(0, 6).map((sub) => (
                    <li key={sub.id}>
                      <Link
                        href={`/collections/${sub.handle}`}
                        className="text-[13px] text-gray-500 hover:text-brand transition-colors"
                      >
                        {sub.title}
                      </Link>
                    </li>
                  ))}
                  {cat.children.length > 6 && (
                    <li>
                      <Link
                        href={`/collections/${cat.handle}`}
                        className="text-[13px] font-medium text-brand hover:underline"
                      >
                        +{cat.children.length - 6} további
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
