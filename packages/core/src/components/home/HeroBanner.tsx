import Link from "next/link";

type Banner = {
  id: number;
  title: string;
  subtitle: string;
  description?: string;
  price?: string;
  href: string;
  cta: string;
  image: string;
  bgColor: string;
  isPromo?: boolean;
};

// Decorative promo tiles. Background colours are intentional design accents
// (not brand-driven) — the mosaic look is shared across brands.
const bannerData: Banner[] = [
  { id: 1, title: "Magnézium-biszglicinát", subtitle: "300 mg", description: "180 kapszula", href: "/search?q=magn%C3%A9zium", cta: "A kínálatra", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80", bgColor: "#5BBFB3" },
  { id: 2, title: "-17", subtitle: "Extra megtakarítások hete", description: "Kód: EXTRA17", href: "/search?q=akci%C3%B3", cta: "A kínálatra", image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80", bgColor: "#C4D94A", isPromo: true },
  { id: 3, title: "Fekete maca komplex", subtitle: "5000 mg", price: "7.490 Ft", href: "/search?q=maca", cta: "A kínálatra", image: "https://images.unsplash.com/photo-1516195851888-6f1a981a862e?w=600&q=80", bgColor: "#FAF5F0" },
  { id: 4, title: "BIO kókuszolaj", subtitle: "hidegen sajtolt, extra szűz", price: "7.490 Ft", href: "/search?q=k%C3%B3kusz", cta: "A kínálatra", image: "https://images.unsplash.com/photo-1550259114-ad7188f0a967?w=600&q=80", bgColor: "#FDF6E9" },
  { id: 5, title: "GLP-1 Modulation", subtitle: "komplex az anyagcsere támogatására", description: "120 kapszula", href: "/search?q=komplex", cta: "A kínálatra", image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&q=80", bgColor: "#E8F4E5" },
  { id: 6, title: "Krill olaj", subtitle: "1200 mg", description: "120 lágy kapszula", href: "/search?q=krill", cta: "A kínálatra", image: "https://images.unsplash.com/photo-1556306535-38febf6782e7?w=500&q=80", bgColor: "#4BA3C3" },
  { id: 7, title: "Berberin HCL", subtitle: "500 mg", description: "180 kapszula", href: "/search?q=berberin", cta: "A kínálatra", image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=500&q=80", bgColor: "#E8A4B8" },
] as const;

const Arrow = ({ className = "w-4 h-4 ml-1" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export function HeroBanner() {
  return (
    <section className="bg-white" data-testid="hero-banner">
      {/* Promo strip — brand-coloured */}
      <div className="bg-brand text-brand-fg py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm text-center">
          <svg className="w-5 h-5 text-amber-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">HETI AKCIÓ - Használd ki a 17% kedvezményt a kínálatunkban található összes termékre.</span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded text-xs font-bold flex-shrink-0">
            Adja hozzá a/az EXTRA17 kódot
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Desktop mosaic */}
        <div className="hidden lg:grid grid-cols-12 grid-rows-[280px_220px] gap-4">
          <Link href={bannerData[0].href} className="col-span-3 relative overflow-hidden rounded-2xl group" style={{ backgroundColor: bannerData[0].bgColor }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerData[0].image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500" />
            <div className="relative h-full p-5 flex flex-col">
              <div>
                <h3 className="font-heading font-bold text-2xl text-white leading-tight drop-shadow-sm">{bannerData[0].title}</h3>
                <p className="text-white/90 text-lg font-medium">{bannerData[0].subtitle}</p>
                <p className="text-white/80 text-sm mt-1">{bannerData[0].description}</p>
              </div>
              <div className="mt-auto">
                <span className="text-white text-sm font-medium inline-flex items-center group-hover:underline">{bannerData[0].cta}<Arrow /></span>
              </div>
            </div>
          </Link>

          <Link href={bannerData[1].href} className="col-span-5 relative overflow-hidden rounded-2xl group" style={{ backgroundColor: bannerData[1].bgColor }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerData[1].image} alt="" className="absolute right-0 bottom-0 w-1/2 h-full object-contain opacity-60 group-hover:scale-105 transition-transform duration-500" />
            <div className="relative h-full p-6 flex flex-col items-center justify-center text-center">
              <span className="text-green-800 text-sm font-medium mb-1">{bannerData[1].subtitle}</span>
              <div className="font-heading font-black text-7xl text-white drop-shadow-lg flex items-start">{bannerData[1].title}<span className="text-4xl mt-2">%</span></div>
              <div className="bg-white/95 rounded-lg px-4 py-2 mt-3 mb-4 shadow-sm"><span className="font-bold text-green-800">{bannerData[1].description}</span></div>
              <span className="px-6 py-2.5 bg-white text-gray-800 rounded-lg font-semibold shadow-md border border-gray-200">{bannerData[1].cta}</span>
            </div>
          </Link>

          <Link href={bannerData[2].href} className="col-span-4 relative overflow-hidden rounded-2xl group" style={{ backgroundColor: bannerData[2].bgColor }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerData[2].image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-transparent to-transparent" />
            <div className="relative h-full p-5 flex flex-col justify-end items-end text-right">
              <h3 className="font-heading font-bold text-2xl text-white drop-shadow-md">{bannerData[2].title}</h3>
              <p className="text-white/90 font-medium">{bannerData[2].subtitle}</p>
              <p className="text-white text-sm mt-1">Csak</p>
              <p className="text-white font-bold text-2xl">{bannerData[2].price}</p>
            </div>
          </Link>

          <Link href={bannerData[3].href} className="col-span-4 relative overflow-hidden rounded-2xl group" style={{ backgroundColor: bannerData[3].bgColor }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerData[3].image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="relative h-full p-5 flex flex-col justify-end">
              <h3 className="font-heading font-bold text-2xl text-amber-900 drop-shadow-sm">{bannerData[3].title}</h3>
              <p className="text-amber-800 font-medium text-sm">{bannerData[3].subtitle}</p>
              <p className="text-amber-900 text-sm mt-2">Csak</p>
              <p className="text-amber-900 font-bold text-2xl">{bannerData[3].price}</p>
            </div>
          </Link>

          <Link href={bannerData[4].href} className="col-span-3 relative overflow-hidden rounded-2xl group" style={{ backgroundColor: bannerData[4].bgColor }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerData[4].image} alt="" className="absolute right-0 bottom-0 w-1/2 h-full object-contain opacity-50 group-hover:scale-105 transition-transform duration-500" />
            <div className="relative h-full p-4 flex flex-col justify-end">
              <h3 className="font-heading font-bold text-xl text-green-900">{bannerData[4].title}</h3>
              <p className="text-green-800 text-xs leading-tight">{bannerData[4].subtitle}</p>
              <p className="text-green-700 text-xs mt-1">{bannerData[4].description}</p>
              <span className="text-green-800 text-xs font-medium inline-flex items-center mt-2 group-hover:underline">{bannerData[4].cta}<Arrow className="w-3 h-3 ml-1" /></span>
            </div>
          </Link>

          <Link href={bannerData[5].href} className="col-span-2 relative overflow-hidden rounded-2xl group" style={{ backgroundColor: bannerData[5].bgColor }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerData[5].image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" />
            <div className="relative h-full p-4 flex flex-col justify-end">
              <h3 className="font-heading font-bold text-lg text-white drop-shadow-sm">{bannerData[5].title}</h3>
              <p className="text-white/90 text-sm font-medium">{bannerData[5].subtitle}</p>
              <p className="text-white/80 text-xs mt-1">{bannerData[5].description}</p>
              <span className="text-white text-xs font-medium inline-flex items-center mt-2 group-hover:underline">{bannerData[5].cta}<Arrow className="w-3 h-3 ml-1" /></span>
            </div>
          </Link>

          <Link href={bannerData[6].href} className="col-span-3 relative overflow-hidden rounded-2xl group" style={{ backgroundColor: bannerData[6].bgColor }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerData[6].image} alt="" className="absolute right-0 bottom-0 w-1/2 h-full object-contain opacity-50 group-hover:scale-105 transition-transform duration-500" />
            <div className="relative h-full p-4 flex flex-col justify-end">
              <h3 className="font-heading font-bold text-xl text-emerald-900">{bannerData[6].title}</h3>
              <p className="text-emerald-800 text-sm font-medium">{bannerData[6].subtitle}</p>
              <p className="text-emerald-700 text-xs mt-1">{bannerData[6].description}</p>
              <span className="text-emerald-800 text-xs font-medium inline-flex items-center mt-2 group-hover:underline">{bannerData[6].cta}<Arrow className="w-3 h-3 ml-1" /></span>
            </div>
          </Link>
        </div>

        {/* Tablet / mobile fallback grid — first feature tile + promo span full
            width, the rest fall into 2-column pairs (no awkward empty cells). */}
        <div className="grid lg:hidden grid-cols-2 gap-3 sm:gap-4">
          {bannerData.map((banner, index) => (
            <Link
              key={banner.id}
              href={banner.href}
              className={`relative overflow-hidden rounded-2xl group ${
                banner.isPromo || index === 0 ? "col-span-2 min-h-[200px]" : "min-h-[180px]"
              }`}
              style={{ backgroundColor: banner.bgColor }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="relative h-full p-4 flex flex-col justify-end">
                {banner.isPromo ? (
                  <div className="text-center flex flex-col items-center justify-center h-full">
                    <span className="text-green-800 text-sm font-medium">{banner.subtitle}</span>
                    <div className="font-heading font-bold text-5xl text-white drop-shadow-lg">{banner.title}<span className="text-3xl">%</span></div>
                    <div className="bg-white/90 rounded-lg px-3 py-1 mt-2 mb-3"><span className="font-bold text-green-800 text-sm">{banner.description}</span></div>
                    <span className="px-4 py-1.5 bg-white text-gray-800 rounded-lg text-sm font-medium">{banner.cta}</span>
                  </div>
                ) : (
                  <>
                    <h3 className="font-heading font-bold text-xl text-white drop-shadow-md">{banner.title}</h3>
                    <p className="text-white/90 text-sm">{banner.subtitle}</p>
                    {banner.price && <p className="text-white font-bold text-lg mt-1">{banner.price}</p>}
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
