"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { formatPrice, type SearchSuggestion } from "../../catalog";

/**
 * Search input with live predictive-search suggestions. Debounces keystrokes and
 * hits the app's `/api/search` route (which each brand app implements over the
 * Storefront predictiveSearch query). Enter / the button still routes to the full
 * /search results page.
 */
export function SearchBar({ size = "desktop" }: { size?: "desktop" | "mobile" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced fetch of suggestions.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(Array.isArray(data.products) ? data.products : []);
      } catch {
        /* aborted or failed — leave prior results */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = query.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  const isMobile = size === "mobile";
  const inputCls = isMobile
    ? "w-full h-[42px] pl-4 pr-12 rounded-full bg-[#f2f2f0] border-0 text-[14px] text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand/30"
    : "w-full h-12 pl-5 pr-14 rounded-full bg-gray-100 border-0 text-gray-700 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-colors";
  const btnCls = isMobile
    ? "absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-ink hover:bg-ink-dark flex items-center justify-center"
    : "absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink hover:bg-ink-dark flex items-center justify-center";

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative w-full" data-testid="search-bar">
      <form onSubmit={submit}>
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Milyen terméket keresel?"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            aria-label="Keresés"
            autoComplete="off"
            className={inputCls}
          />
          <button type="submit" className={btnCls} aria-label="Keresés">
            <Search className="w-4 h-4 text-white" />
          </button>
        </div>
      </form>

      {showDropdown && (
        <div
          className="absolute z-[80] left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-brand shadow-xl overflow-hidden"
          data-testid="search-suggestions"
        >
          {loading && results.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Keresés…
            </div>
          ) : results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-gray-500">Nincs találat erre: „{query.trim()}”</p>
          ) : (
            <>
              <ul className="max-h-[60vh] overflow-y-auto py-1">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/products/${p.handle}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <span className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                        {p.featuredImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.featuredImage.url}
                            alt={p.featuredImage.altText ?? p.title}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </span>
                      <span className="flex-1 min-w-0 text-sm text-gray-800 line-clamp-2">{p.title}</span>
                      <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                        {formatPrice(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={submit}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-brand border-t border-gray-100 hover:bg-gray-50 transition-colors"
              >
                Összes találat megtekintése „{query.trim()}”
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
