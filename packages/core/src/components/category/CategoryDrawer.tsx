"use client";

import Link from "next/link";
import { ChevronRight, X, Package } from "lucide-react";
import type { CollectionSummary } from "../../shopify";

export function CategoryDrawer({
  open,
  onClose,
  collections,
}: {
  open: boolean;
  onClose: () => void;
  collections: CollectionSummary[];
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/30"
        onClick={onClose}
        data-testid="category-drawer-backdrop"
      />
      <div
        className="fixed top-0 left-0 z-[70] h-full w-[85vw] max-w-[360px] bg-white shadow-xl flex flex-col animate-slide-in-left"
        role="dialog"
        aria-label="Kategóriák"
        data-testid="category-drawer"
      >
        <div className="flex items-center justify-between px-5 h-[60px] border-b border-gray-100">
          <span className="font-heading font-bold text-lg text-gray-900">Kategóriák</span>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Bezárás"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {collections.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">Nincs elérhető kategória.</p>
          ) : (
            collections.map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.handle}`}
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                {col.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={col.image.url}
                    alt={col.image.altText ?? col.title}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                  </span>
                )}
                <span className="flex-1 text-sm font-semibold text-gray-900">{col.title}</span>
                <ChevronRight className="w-5 h-5 text-brand flex-shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
