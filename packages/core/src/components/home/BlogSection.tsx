"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    date: "2026. Január 14.",
    title: "Milyen vitaminokra van szükségünk télen?",
    image: "https://images.unsplash.com/photo-1627394376504-24507bf9f7eb?w=600&q=80",
    href: "#",
  },
  {
    id: 2,
    date: "2026. Január 8.",
    title: "Torokfájás, köhögés, orrdugulás: mit érdemes tudni?",
    image: "https://images.unsplash.com/photo-1611178239338-bc6232793df1?w=600&q=80",
    href: "#",
  },
  {
    id: 3,
    date: "2025. December 28.",
    title: "Magnézium: mikor és hogyan érdemes szedni?",
    image: "https://images.unsplash.com/photo-1770782773560-2b8180f9032d?w=600&q=80",
    href: "#",
  },
  {
    id: 4,
    date: "2025. December 15.",
    title: "Biztonságos méregtelenítés és emésztésjavítás",
    image: "https://images.unsplash.com/photo-1642116892223-500a772219f2?w=600&q=80",
    href: "#",
  },
  {
    id: 5,
    date: "2025. December 3.",
    title: "D-vitamin a téli hónapokban – Mennyi kell és miért hiányzik?",
    image: "https://images.unsplash.com/photo-1688547978797-fe7f52697265?w=600&q=80",
    href: "#",
  },
];

export function BlogSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = (el.firstElementChild as HTMLElement)?.offsetWidth || 1;
    const gap = 16;
    const idx = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(idx, blogPosts.length - 1));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActiveIndex, { passive: true });
    return () => el.removeEventListener("scroll", updateActiveIndex);
  }, [updateActiveIndex]);

  const scrollToIndex = (idx: number) => {
    const el = scrollRef.current;
    if (!el || !el.firstElementChild) return;
    const cardWidth = (el.firstElementChild as HTMLElement).offsetWidth;
    const gap = 16;
    el.scrollTo({ left: idx * (cardWidth + gap), behavior: "smooth" });
  };

  return (
    <section className="py-12 md:py-16 bg-white" data-testid="blog-section">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">Blog</h2>
          <Link
            href="#"
            className="inline-flex items-center gap-0.5 text-gray-500 hover:text-brand text-[15px] transition-colors"
          >
            Tovább a bloghoz
            <ChevronRight className="w-5 h-5 text-brand" />
          </Link>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 pl-4 pr-4 md:pl-0 md:pr-0"
          data-testid="blog-carousel"
        >
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={post.href}
              className="flex-shrink-0 w-[75vw] sm:w-[45vw] lg:w-[calc(33.333%-12px)] snap-start group"
              data-testid={`blog-card-${post.id}`}
            >
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs text-gray-400 mb-2">{post.date}</span>
                  <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-4 line-clamp-3 flex-1">
                    {post.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-brand text-sm font-semibold group-hover:gap-2 transition-all">
                    Teljes leírás
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-6" data-testid="blog-pagination-dots">
          {blogPosts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                idx === activeIndex ? "bg-brand" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
