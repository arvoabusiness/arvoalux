"use client";

import type { ProductCard } from "../catalog";
import { ProductGrid } from "./product/ProductGrid";

/** SSR remains native HTML; one synchronous view prevents partial Flight host-tree hydration. */
export function ArvoaluxCollectionView({ title, description, products, brandHandle, failed, after, nextCursor, firstHref, retryHref, nextHref }: {
  title: string; description: string; products: ProductCard[]; brandHandle: string;
  failed: boolean; after?: string; nextCursor: string | null;
  firstHref: string; retryHref: string; nextHref: string;
}) {
  const linkClass = "inline-flex min-h-12 items-center border border-current px-4 py-3 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4";
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-gray-900 mb-2">{title}</h1>
      {description && <p className="text-gray-500 mb-8 max-w-2xl">{description}</p>}
      <div className="mt-6">{failed
        ? <p role="alert">A terméklista nem tölthető be. Kérjük, próbálja újra.</p>
        : <ProductGrid products={products} brandHandle={brandHandle} />}</div>
      {(after || nextCursor || failed) && <nav aria-label="Terméklista lapozása" className="mt-8 mb-20 flex flex-wrap gap-4">
        {(after || failed) && <a href={firstHref} className={linkClass}>Első oldal</a>}
        {failed && <a href={retryHref} className={linkClass}>Újrapróbálkozás</a>}
        {nextCursor && <a href={nextHref} rel="next" className={linkClass}>Következő oldal</a>}
      </nav>}
    </div>
  );
}
