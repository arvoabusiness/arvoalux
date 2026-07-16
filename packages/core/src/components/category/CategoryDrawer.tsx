"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, X, Package } from "lucide-react";
import { buildCategoryTree, type CollectionSummary } from "../../catalog";

export function CategoryDrawer({
  open,
  onClose,
  collections,
}: {
  open: boolean;
  onClose: () => void;
  collections: CollectionSummary[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!open) return null;

  const tree = buildCategoryTree(collections);

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
          {tree.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">Nincs elérhető kategória.</p>
          ) : (
            tree.map((cat) => {
              const isOpen = expanded === cat.handle;
              const hasChildren = cat.children.length > 0;
              return (
                <div key={cat.id} className="border-b border-gray-50">
                  <div className="flex items-center">
                    <Link
                      href={`/collections/${cat.handle}`}
                      onClick={onClose}
                      className="flex items-center gap-3 flex-1 min-w-0 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                    >
                      {cat.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cat.image.url}
                          alt={cat.image.altText ?? cat.title}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                        </span>
                      )}
                      <span className="flex-1 text-sm font-semibold text-gray-900 min-w-0">
                        {cat.title}
                      </span>
                    </Link>
                    {hasChildren ? (
                      <button
                        onClick={() => setExpanded(isOpen ? null : cat.handle)}
                        aria-label={isOpen ? "Bezárás" : "Alkategóriák"}
                        aria-expanded={isOpen}
                        className="px-4 py-3.5 flex-shrink-0 text-gray-500 hover:text-brand transition-colors"
                      >
                        {isOpen ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                    ) : (
                      <span className="px-4 py-3.5 flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-brand" />
                      </span>
                    )}
                  </div>

                  {hasChildren && isOpen && (
                    <ul className="bg-gray-50/60 pb-2">
                      {cat.children.map((sub) => (
                        <li key={sub.id}>
                          <Link
                            href={`/collections/${sub.handle}`}
                            onClick={onClose}
                            className="block pl-16 pr-5 py-2.5 text-[13px] text-gray-600 hover:text-brand transition-colors"
                          >
                            {sub.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
