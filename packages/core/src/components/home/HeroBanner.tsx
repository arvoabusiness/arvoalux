import Link from "next/link";
import type { Brand } from "../../types";
import {
  getHeroCampaigns,
  type HeroCampaign,
  type HeroIcon,
  type HeroTone,
} from "./heroCampaigns";

const toneClasses: Record<HeroTone, string> = {
  brand: "bg-gray-950 text-white",
  amber: "bg-amber-100 text-amber-950",
  sky: "bg-sky-100 text-sky-950",
  sage: "bg-emerald-100 text-emerald-950",
};

const accentClasses: Record<HeroTone, string> = {
  brand: "bg-white/15 border-white/25",
  amber: "bg-amber-300/55 border-amber-700/10",
  sky: "bg-sky-300/55 border-sky-700/10",
  sage: "bg-emerald-300/55 border-emerald-700/10",
};

function Arrow() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-5-5 5 5-5 5" />
    </svg>
  );
}

function CampaignIcon({ icon }: { icon: HeroIcon }) {
  const paths: Record<HeroIcon, React.ReactNode> = {
    spark: <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Zm6 12 .9 2.1L21 17l-2.1.9L18 20l-.9-2.1L15 17l2.1-.9L18 14Z" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />,
    drop: <path d="M12 2S5.5 9.1 5.5 14.2a6.5 6.5 0 0 0 13 0C18.5 9.1 12 2 12 2Z" />,
    leaf: <><path d="M20 4C11 4 5 8.8 5 15a5 5 0 0 0 5 5c6.2 0 10-7 10-16Z" /><path d="M4 20c2.5-5 6.5-8.5 12-11" /></>,
  };
  return (
    <svg aria-hidden="true" className="h-11 w-11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {paths[icon]}
    </svg>
  );
}

function SupportingCard({ campaign }: { campaign: HeroCampaign }) {
  return (
    <Link
      href={campaign.href}
      className={`group relative min-h-48 overflow-hidden rounded-3xl p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white ${toneClasses[campaign.tone]}`}
      aria-label={`${campaign.title}: ${campaign.cta}`}
    >
      <div aria-hidden="true" className={`absolute -right-8 -top-10 h-36 w-36 rounded-full border ${accentClasses[campaign.tone]}`} />
      <div className="relative flex h-full flex-col">
        <span className="text-xs font-bold tracking-[0.16em]">{campaign.eyebrow}</span>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-bold leading-tight">{campaign.title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6">{campaign.description}</p>
          </div>
          <CampaignIcon icon={campaign.icon} />
        </div>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold">
          {campaign.cta}<Arrow />
        </span>
      </div>
    </Link>
  );
}

export function HeroBanner({ brand }: { brand: Brand }) {
  const [primary, ...supporting] = getHeroCampaigns(brand.handle);

  return (
    <section className="bg-white" data-testid="hero-banner" aria-labelledby="hero-title">
      <div className="border-y border-gray-800 bg-gray-950 px-4 py-2.5 text-white">
        <p className="mx-auto max-w-7xl text-center text-sm font-semibold">
          Gyorskeresések · C-vitamin, magnézium és omega-3
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:py-7">
        <div className="grid gap-4 lg:grid-cols-12 lg:grid-rows-2">
          <Link
            href={primary.href}
            className={`group relative min-h-[340px] overflow-hidden rounded-3xl border-t-8 border-brand p-6 shadow-sm transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black focus-visible:ring-offset-4 focus-visible:ring-offset-white sm:p-9 lg:col-span-7 lg:row-span-2 lg:min-h-[500px] ${toneClasses[primary.tone]}`}
            aria-label={`${primary.title}: ${primary.cta}`}
          >
            <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/25 bg-white/10" />
            <div aria-hidden="true" className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full border border-white/20 bg-black/5" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full border border-current/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.16em]">
                  {primary.eyebrow}
                </span>
                <CampaignIcon icon={primary.icon} />
              </div>
              <div className="mt-auto max-w-xl pt-20">
                <p className="text-sm font-semibold">{brand.name}</p>
                <h1 id="hero-title" className="mt-2 font-heading text-4xl font-bold leading-[1.06] sm:text-5xl lg:text-6xl">
                  {primary.title}
                </h1>
                <p className="mt-4 max-w-lg text-base leading-7 sm:text-lg">{primary.description}</p>
                <span className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-gray-950 shadow-sm">
                  {primary.cta}<Arrow />
                </span>
              </div>
            </div>
          </Link>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
            {supporting.slice(0, 2).map((campaign) => <SupportingCard key={campaign.id} campaign={campaign} />)}
          </div>
          <div className="lg:col-span-5">
            <SupportingCard campaign={supporting[2]} />
          </div>
        </div>
      </div>
    </section>
  );
}
