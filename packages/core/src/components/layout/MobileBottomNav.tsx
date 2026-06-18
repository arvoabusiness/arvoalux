"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Heart, User, ShoppingBag } from "lucide-react";
import type { Brand } from "../../types";
import type { CollectionSummary } from "../../shopify";
import { CategoryDrawer } from "../category/CategoryDrawer";

export function MobileBottomNav({
  brand,
  collections,
}: {
  brand: Brand;
  collections: CollectionSummary[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
        data-testid="mobile-bottom-nav"
      >
        <div className="flex items-stretch justify-around h-[60px]">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500 active:bg-gray-50 transition-colors"
          >
            <Grid2X2 className="w-[22px] h-[22px]" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold leading-tight">Kategóriák</span>
          </button>

          <Link
            href="#"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500 transition-colors active:bg-gray-50"
          >
            <Heart className="w-[22px] h-[22px]" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold leading-tight">Kívánságlista</span>
          </Link>

          <Link
            href="#"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500 transition-colors active:bg-gray-50"
          >
            <User className="w-[22px] h-[22px]" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold leading-tight">Belépés</span>
          </Link>

          <Link
            href="/cart"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:bg-gray-50 ${
              isActive("/cart") ? "text-brand" : "text-gray-500"
            }`}
          >
            <ShoppingBag className="w-[22px] h-[22px]" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold leading-tight">Kosár</span>
          </Link>
        </div>
      </nav>

      <CategoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} collections={collections} />
    </>
  );
}
