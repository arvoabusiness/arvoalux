"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Heart, Grid2X2, Tag, Phone, Truck, FileText, Info } from "lucide-react";
import type { Brand } from "../../types";
import type { CollectionSummary } from "../../shopify";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { CategoryDrawer } from "../category/CategoryDrawer";
import { BrandWordmark } from "../brand/BrandWordmark";

const utilityItems = [
  { icon: Truck, text: "Ingyenes szállítás", highlight: "17 990 Ft", suffix: "felett" },
  { icon: Phone, text: "+36-20/931-9009", highlight: "(Minden nap 9-21 óráig)" },
  { icon: FileText, text: "Rendelés menete", to: "#" },
  { icon: Info, text: "Rólunk", to: "#" },
];

export function Header({ brand, collections }: { brand: Brand; collections: CollectionSummary[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const saleHref = `/collections/${brand.collectionHandle}`;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

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
              <a href="tel:+36209319009" className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>+36-20/931-9009</span>
              </a>
              <span className="text-gray-400">Ingyenes szállítás 17 990 Ft felett</span>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="bg-white shadow-sm">
          <div className="flex items-stretch h-[60px] sm:h-[85px]">
            <div className="flex-1 flex items-center min-w-0 px-3 sm:px-4">
              <div className="flex-shrink-0 mr-1 sm:mr-2 lg:mr-4">
                <span className="sm:hidden"><BrandWordmark name={brand.name} size="sm" /></span>
                <span className="hidden sm:inline-flex"><BrandWordmark name={brand.name} size="md" /></span>
              </div>

              {/* Mobile search */}
              <form onSubmit={handleSearch} className="sm:hidden flex-1 mr-3">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Milyen terméket keresel?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-[42px] pl-4 pr-12 rounded-full bg-[#f2f2f0] border-0 text-[14px] text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand/30"
                  />
                  <Button type="submit" size="icon" className="absolute right-1 w-9 h-9 rounded-full bg-ink hover:bg-ink-dark">
                    <Search className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </form>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center gap-1">
                <Button variant="ghost" className="flex items-center gap-2 px-4 py-2 h-auto font-bold text-gray-900 hover:bg-gray-100" onClick={() => setDrawerOpen(true)}>
                  <Grid2X2 className="w-5 h-5" />
                  <span>Kategóriák</span>
                </Button>
                <Link href={saleHref} className="flex items-center gap-2 px-4 py-2 font-bold text-brand hover:bg-brand-50 rounded-lg transition-colors">
                  <Tag className="w-5 h-5" />
                  <span>Akciók</span>
                </Link>
              </div>

              {/* Desktop search */}
              <form onSubmit={handleSearch} className="flex-1 mx-4 lg:mx-8 hidden sm:flex">
                <div className="relative w-full">
                  <Input
                    type="text"
                    placeholder="Milyen terméket keresel?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-5 pr-14 rounded-full bg-gray-100 border-0 text-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-brand focus:bg-white"
                  />
                  <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-ink hover:bg-ink-dark w-10 h-10">
                    <Search className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </form>

              {/* Right actions */}
              <div className="hidden lg:flex items-center gap-2">
                <Link href="#" className="flex items-center gap-2 px-3 py-2 h-auto font-bold text-gray-900 hover:bg-gray-100 rounded-md">
                  <Heart className="w-5 h-5" />
                  <span>Kívánságlista</span>
                </Link>
                <Link href="#" className="flex items-center gap-2 px-3 py-2 h-auto font-bold text-gray-900 hover:bg-gray-100 rounded-md">
                  <User className="w-5 h-5" />
                  <span>Bejelentkezés</span>
                </Link>
              </div>
            </div>

            {/* Cart */}
            <Link
              href="/cart"
              className="hidden lg:flex flex-shrink-0 h-auto px-8 bg-brand hover:bg-brand-dark text-brand-fg items-center gap-3 transition-colors"
              data-testid="cart-btn"
            >
              <ShoppingBag className="w-6 h-6" />
              <span className="font-bold text-base">Kosár</span>
            </Link>
          </div>
        </div>
      </header>

      <CategoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} collections={collections} />
    </>
  );
}
