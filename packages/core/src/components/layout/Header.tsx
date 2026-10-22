"use client";
import {CustomerMenu} from "../account/AccountWidgets";
import { CartTrigger } from "../CommerceCart";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, User, Heart, LayoutGrid, BadgePercent, Phone, Truck, FileText, Info } from "lucide-react";
import type { Brand } from "../../types";
import type { CollectionSummary } from "../../shopify";
import { Button } from "../ui/button";
import { CategoryDrawer } from "../category/CategoryDrawer";
import { BrandWordmark } from "../brand/BrandWordmark";
import { SearchBar } from "./SearchBar";

const getUtilityItems = (brandHandle: string) => brandHandle === "arvoalux" ? [
  { icon: Info, text: "Rendelés menete", highlight: "", suffix: "", to: "/info/order-process" },
  { icon: Phone, text: "+36-20/931-9009", highlight: "(hétfőtől péntekig 09:30–16:30)", suffix: "", to: "tel:+36209319009" },
  { icon: Info, text: "Rólunk", highlight: "", suffix: "", to: "/info/about" },
] : [
  { icon: Truck, text: "Ingyenes szállítás", highlight: brandHandle === "arvoalux" ? "19 990 Ft-tól" : "19 990 Ft", suffix: brandHandle === "arvoalux" ? "" : "felett", to: brandHandle === "arvoalux" ? "/shipping-payment" : "#" },
  { icon: Phone, text: "+36-20/931-9009", highlight: brandHandle === "arvoalux" ? "(hétfőtől péntekig 09:30–16:30)" : "(Minden nap 9-21 óráig)", to: brandHandle === "arvoalux" ? "tel:+36209319009" : "#" },
  { icon: FileText, text: "Rendelés menete", to: brandHandle === "arvoalux" ? "/info/order-process" : "#" },
  { icon: Info, text: "Rólunk", to: brandHandle === "arvoalux" ? "/info/about" : "#" },
];

export function Header({ brand, collections }: { brand: Brand; collections: CollectionSummary[] }) {
  const utilityItems = getUtilityItems(brand.handle);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const saleHref = "/akciok";

  return (
    <>
      <header className="sticky top-0 z-50">
        {/* Utility bar */}
        <div className="bg-ink text-white">
          <div className="px-4">
            <div className="hidden lg:flex items-center justify-between h-[38px] text-xs">
              <div className="flex items-center gap-6">
                {utilityItems.slice(0, 2).map((item, idx) => (
                  <Link key={idx} href={item.to || "#"} className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
                    <item.icon className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {item.highlight && <span className="font-semibold text-white">{item.highlight}</span>}
                      {item.highlight && " "}
                      {item.text}
                      {item.suffix && ` ${item.suffix}`}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-6">
                {utilityItems.slice(2).map((item, idx) => (
                  <Link key={idx} href={item.to || "#"} className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
                    <item.icon className="w-3.5 h-3.5 text-gray-400" />
                    <span>{item.text}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="lg:hidden flex items-center justify-between h-[34px] text-xs">
              <a href={brand.handle === "arvoalux" ? "tel:+36209319009" : "tel:+362****9009"} className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>+36-20/931-9009</span>
              </a>
              <span className="text-gray-400">{brand.handle === "arvoalux" ? "Ingyenes szállítás 19 990 Ft felett" : "Ingyenes szállítás 19 990 Ft felett"}</span>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-stretch h-[60px] sm:h-[85px]">
            <div className="flex-1 flex items-center min-w-0 px-3 sm:px-4">
              <div className="flex-shrink-0 mr-1 sm:mr-2 lg:mr-4">
                <span className="sm:hidden"><BrandWordmark name={brand.name} brandHandle={brand.handle} size="sm" /></span>
                <span className="hidden sm:inline-flex"><BrandWordmark name={brand.name} brandHandle={brand.handle} size="md" /></span>
              </div>

              {/* Mobile search */}
              <div className="sm:hidden flex-1 mr-3">
                <SearchBar size="mobile" nativeSearch={brand.handle === "arvoalux"} />
              </div>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-1">
                <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 h-auto font-bold text-gray-900 hover:bg-gray-100" onClick={() => setDrawerOpen(true)}>
                  <LayoutGrid className="w-5 h-5" />
                  <span>Kategóriák</span>
                </Button>
                <Link href={saleHref} style={{color:"#e7354d"}} className="flex items-center gap-2 px-4 py-2 font-bold text-brand hover:bg-brand-50 rounded-lg transition-colors">
                  <BadgePercent className="w-5 h-5" />
                  <span>Akciók</span>
                </Link>
              </div>

              {/* Desktop search */}
              <div className="flex-1 mx-4 lg:mx-8 hidden sm:flex">
                <SearchBar size="desktop" nativeSearch={brand.handle === "arvoalux"} />
              </div>

              {/* Right actions */}
              {true && <div className="hidden lg:flex items-center gap-2">
                <Link href="/account/wishlist" aria-label="Kívánságlista" className="flex items-center gap-2 px-3 py-2 h-auto font-bold text-gray-900 hover:bg-gray-100 rounded-md">
                  <Heart className="w-5 h-5" />
                  <span>Kívánságlista</span>
                </Link>
                <CustomerMenu className="approved-header-account" />
              </div>}
            </div>

            {/* Cart */}
            <CartTrigger className="hidden lg:flex flex-shrink-0 h-auto px-8 bg-brand hover:bg-brand-dark text-brand-fg items-center gap-3 transition-colors" />
          </div>
        </div>
      </header>

      <CategoryDrawer brandHandle={brand.handle} open={drawerOpen} onClose={() => setDrawerOpen(false)} collections={collections} />
    </>
  );
}
