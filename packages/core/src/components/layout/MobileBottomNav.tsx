"use client";
import {CustomerMenu} from "../account/AccountWidgets";
import { CartTrigger, useCartActions } from "../CommerceCart";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, BadgePercent, Heart, User, ShoppingBag } from "lucide-react";
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
  const cart = useCartActions();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const navigation = (
      <nav onClick={event => { if ((event.target as Element).closest("a")) cart.close(); }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
        data-testid="mobile-bottom-nav"
      >
        <div className="flex items-stretch justify-around h-[60px]">
          <button
            onClick={() => { cart.close(); setDrawerOpen(true); }}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500 active:bg-gray-50 transition-colors"
          >
            <LayoutGrid className="w-[22px] h-[22px]" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold leading-tight">Kategóriák</span>
          </button>
          <Link href="/akciok" className="flex-1 flex flex-col items-center justify-center gap-0.5" style={{color:"#e7354d"}}><BadgePercent className="w-[22px] h-[22px]" strokeWidth={1.8}/><span className="text-[10px] font-semibold leading-tight">Akciók</span></Link>

          {true && <><Link
            href="/account/wishlist"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500 transition-colors active:bg-gray-50"
          >
            <Heart className="w-[22px] h-[22px]" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold leading-tight">Kívánságlista</span>
          </Link>

          <CustomerMenu mobile /></>}

          <CartTrigger mobile className="flex-1 flex flex-col items-center justify-center gap-0.5 text-gray-500" />
        </div>
      </nav>
  );
  return (
    <>
      {cart.drawerNavigationTarget ? createPortal(navigation, cart.drawerNavigationTarget) : navigation}
      <CategoryDrawer brandHandle={brand.handle} open={drawerOpen} onClose={() => setDrawerOpen(false)} collections={collections} />
    </>
  );
}
