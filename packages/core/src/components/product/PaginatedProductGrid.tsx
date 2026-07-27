"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { sellable, type ProductCard as ProductCardData } from "../../catalog";

/**
 * Product grid that pages through a pre-fetched pool client-side. The full list
 * comes from the server component; we only show `pageSize` at a time so the
 * homepage sections stay compact while still exposing the whole catalogue.
 */
export function PaginatedProductGrid({
  products,
  brandHandle,
  pageSize,
}: {
  products: ProductCardData[];
  brandHandle: string;
  pageSize: number;
}) {
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const items = sellable(products);
  const pageCount = Math.ceil(items.length / pageSize);
  const start = (page - 1) * pageSize;
  const visible = items.slice(start, start + pageSize);

  function goTo(next: number) {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div ref={topRef} className="scroll-mt-24 grid grid-cols-2 md:grid-cols-4 gap-4">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} brandHandle={brandHandle} />
        ))}
      </div>

      {pageCount > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Lapozás">
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            aria-label="Előző oldal"
            className="w-9 h-9 rounded-brand border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => goTo(n)}
              aria-current={n === page ? "page" : undefined}
              className={
                n === page
                  ? "w-9 h-9 rounded-brand bg-brand text-brand-fg font-bold text-sm flex items-center justify-center"
                  : "w-9 h-9 rounded-brand border border-gray-200 text-gray-700 font-medium text-sm hover:border-gray-300 flex items-center justify-center transition-colors"
              }
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page === pageCount}
            aria-label="Következő oldal"
            className="w-9 h-9 rounded-brand border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
