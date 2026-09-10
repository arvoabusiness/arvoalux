import Link from "next/link";
import type { Brand } from "../../types";
import {
  type HeroBannerItem,
  type HeroSlot,
} from "./heroCampaigns";
import { loadHeroBanners } from "./heroData";

const desktopSlotClasses: Record<HeroSlot, string> = {
  "top-left": "col-span-3",
  "top-center": "col-span-5",
  "top-right": "col-span-4",
  "bottom-wide": "col-span-4",
  "bottom-small-1": "col-span-3",
  "bottom-small-2": "col-span-2",
  "bottom-small-3": "col-span-3",
};

const Arrow = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-5-5 5 5-5 5" />
  </svg>
);

function BannerContent({ banner, brandName, compact = false, desktop = false }: {
  banner: HeroBannerItem;
  brandName: string;
  compact?: boolean;
  desktop?: boolean;
}) {
  const titleClass = `font-heading font-bold leading-[1.18] text-[#173c2b] ${compact ? "text-xs sm:text-sm" : banner.isPrimary ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"}`;
  const ctaLabel = compact ? banner.mobileCta : desktop ? banner.cta : banner.mobileCta;
  const copyWidthClass = compact
    ? banner.imageScale === "xlarge"
      ? "max-w-full sm:max-w-[38%]"
      : "max-w-full sm:max-w-[44%]"
    : banner.imageScale === "large"
      ? "max-w-[42%]"
      : "max-w-[48%]";
  return (
    <div className={`relative z-10 flex h-full flex-col justify-end ${compact ? "p-3" : "p-5 sm:p-6"}`}>
      {banner.isPrimary && (
        <span className="mb-auto w-fit rounded-full border border-[#b9923f]/40 bg-white/80 px-3 py-1 text-xs font-bold tracking-wide text-[#173c2b] backdrop-blur-sm">
          {brandName}
        </span>
      )}
      {compact && <span aria-hidden="true" className="h-[116px] flex-shrink-0 sm:hidden" />}
      <div data-hero-copy className={copyWidthClass}>
        <h2 className={titleClass}>{banner.title}</h2>
        <p className={`mt-1 font-medium text-gray-700 ${compact ? "text-xs" : "text-xs sm:text-sm"}`}>
          {banner.subtitle}
        </p>
        <span className={`inline-flex min-h-11 items-center rounded-full bg-[#173c2b] py-2 font-bold text-[#fffaf0] shadow-sm ${compact ? "mt-2 gap-1 px-2 text-xs" : "mt-4 gap-2 px-4 text-sm"}`}>
          {ctaLabel}<Arrow />
        </span>
      </div>
    </div>
  );
}

function HeroTile({ banner, brandName, desktop = false }: {
  banner: HeroBannerItem;
  brandName: string;
  desktop?: boolean;
}) {
  const compact = banner.slot.startsWith("bottom-") || (!desktop && !banner.isPrimary);
  const imageScaleClass = banner.imageScale === "xlarge"
    ? "scale-[1.2]"
    : banner.imageScale === "large"
      ? "scale-[1.1]"
      : "scale-100";
  const imageLayoutClass = compact
    ? "right-3 top-3 h-[112px] w-[calc(100%-1.5rem)] object-center origin-center sm:right-2 sm:top-2 sm:h-[calc(100%-1rem)] sm:w-[42%] sm:object-right sm:origin-right"
    : "right-2 top-2 h-[calc(100%-1rem)] w-[38%] object-right origin-right sm:w-[42%]";
  return (
    <Link
      href={banner.href}
      data-hero-slot={banner.slot}
      aria-label={`${banner.title}: ${banner.cta}`}
      className={`group relative block h-full overflow-hidden rounded-2xl border border-[#173c2b]/10 bg-[#f7f2e7] shadow-[0_12px_32px_rgba(23,60,43,0.08)] transition-shadow hover:shadow-[0_16px_38px_rgba(23,60,43,0.14)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#b9923f] focus-visible:ring-offset-4 focus-visible:ring-offset-white ${desktop ? desktopSlotClasses[banner.slot] : "min-h-[180px]"}`}
      style={{ backgroundColor: banner.bgColor }}
    >
      {banner.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          data-hero-image
          src={banner.image}
          alt={banner.imageAlt}
          className={`absolute object-contain mix-blend-multiply ${imageLayoutClass} ${imageScaleClass}`}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/72 to-transparent" />
      <BannerContent banner={banner} brandName={brandName} compact={compact} desktop={desktop} />
    </Link>
  );
}

export async function HeroBanner({ brand }: { brand: Brand }) {
  const banners = await loadHeroBanners(brand.handle);
  if (banners.length !== 7) return null;
  const mobileBanners = [...banners].sort((left, right) => Number(Boolean(right.isPrimary)) - Number(Boolean(left.isPrimary)));

  return (
    <section className="bg-white" data-testid="hero-banner" aria-label={`${brand.name} kiemelt termékei`}>
      <h1 className="sr-only">{brand.name} kiemelt termékei</h1>
      <div className="bg-brand px-4 py-2.5 text-brand-fg">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 text-center text-sm">
          <svg aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Fedezd fel vitaminjainkat és étrend-kiegészítőinket.</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5">
        <div className="hidden grid-cols-12 grid-rows-[280px_220px] gap-4 lg:grid">
          {banners.map((banner) => (
            <HeroTile key={banner.id} banner={banner} brandName={brand.name} desktop />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
          {mobileBanners.map((banner) => (
            <div key={banner.id} className={banner.isPrimary ? "col-span-2 min-h-[240px]" : "min-h-[320px] sm:min-h-[240px]"}>
              <HeroTile banner={banner} brandName={brand.name} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
