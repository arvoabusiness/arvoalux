export type HeroTone = "brand" | "amber" | "sky" | "sage";
export type HeroIcon = "spark" | "sun" | "moon" | "drop" | "leaf";

export type HeroCampaign = {
  id: string;
  brandHandle?: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  tone: HeroTone;
  icon: HeroIcon;
  season: "autumn";
};

const primaryCampaigns = {
  arvoalux: {
    title: "Keresés: multivitamin — Arvoalux",
    description: "Indíts célzott keresést multivitaminokra.",
    query: "multivitamin",
    icon: "spark",
  },
  biobarat: {
    title: "Keresés: immun — BioBarát",
    description: "Indíts keresést az „immun” kifejezésre.",
    query: "immun",
    icon: "leaf",
  },
  boltbio: {
    title: "Keresés: probiotikum — BoltBio",
    description: "Indíts célzott keresést probiotikumokra.",
    query: "probiotikum",
    icon: "leaf",
  },
  nagykervitamin: {
    title: "Keresés: C-vitamin — Nagy Kervitamin",
    description: "Indíts célzott keresést C-vitaminra.",
    query: "C-vitamin",
    icon: "sun",
  },
  napivitamin: {
    title: "Keresés: multivitamin — Napi Vitamin",
    description: "Indíts célzott keresést multivitaminokra.",
    query: "multivitamin",
    icon: "spark",
  },
  nutrimarket: {
    title: "Keresés: omega-3 — NutriMarket",
    description: "Indíts célzott keresést omega-3-termékekre.",
    query: "omega-3",
    icon: "drop",
  },
  prevenciobolt: {
    title: "Keresés: D-vitamin — Prevenciobolt",
    description: "Indíts célzott keresést D-vitaminra.",
    query: "D-vitamin",
    icon: "sun",
  },
  provitaminok: {
    title: "Keresés: magnézium — ProVitaminok",
    description: "Indíts célzott keresést magnéziumra.",
    query: "magnézium",
    icon: "moon",
  },
  vitaminbolt: {
    title: "Keresés: kollagén — VitaminBolt",
    description: "Indíts célzott keresést kollagéntermékekre.",
    query: "kollagén",
    icon: "spark",
  },
} as const;

export const heroBrandHandles = Object.freeze(Object.keys(primaryCampaigns));

export const supportingHeroCampaigns: readonly HeroCampaign[] = Object.freeze([
  {
    id: "autumn-c-vitamin",
    eyebrow: "GYORSKERESÉS",
    title: "C-vitamin",
    description: "Indíts célzott keresést C-vitaminra.",
    href: "/search?q=C-vitamin",
    cta: "C-vitamin keresése",
    tone: "amber",
    icon: "sun",
    season: "autumn",
  },
  {
    id: "magnesium",
    eyebrow: "GYORSKERESÉS",
    title: "Magnézium",
    description: "Indíts célzott keresést magnéziumra.",
    href: "/search?q=magn%C3%A9zium",
    cta: "Keresés indítása",
    tone: "sky",
    icon: "moon",
    season: "autumn",
  },
  {
    id: "omega-three",
    eyebrow: "GYORSKERESÉS",
    title: "Omega-3",
    description: "Indíts célzott keresést omega-3-termékekre.",
    href: "/search?q=omega-3",
    cta: "Omega-3 keresése",
    tone: "sage",
    icon: "drop",
    season: "autumn",
  },
]);

export function getHeroCampaigns(handle: string): readonly HeroCampaign[] {
  const primary = primaryCampaigns[handle as keyof typeof primaryCampaigns] ?? primaryCampaigns.arvoalux;
  return [
    {
      id: `primary-${handle}`,
      brandHandle: handle,
      eyebrow: "GYORSKERESÉS",
      title: primary.title,
      description: primary.description,
      href: `/search?q=${encodeURIComponent(primary.query)}`,
      cta: "Keresés indítása",
      tone: "brand",
      icon: primary.icon,
      season: "autumn",
    },
    ...supportingHeroCampaigns,
  ];
}
