export type HeroSlot =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-wide"
  | "bottom-small-1"
  | "bottom-small-2"
  | "bottom-small-3";

export type HeroBannerItem = {
  id: string;
  slot: HeroSlot;
  title: string;
  subtitle: string;
  description?: string;
  href: string;
  cta: string;
  mobileCta: string;
  image: string;
  imageAlt: string;
  bgColor: string;
  isPrimary?: boolean;
  brandHandle?: string;
};

const heroBrandNames = {
  arvoalux: "Arvoalux",
  biobarat: "BioBarát",
  boltbio: "BoltBio",
  nagykervitamin: "Nagy Kervitamin",
  napivitamin: "Napi Vitamin",
  nutrimarket: "NutriMarket",
  prevenciobolt: "Prevenciobolt",
  provitaminok: "ProVitaminok",
  vitaminbolt: "VitaminBolt",
} as const;

export const heroBrandHandles = Object.freeze(Object.keys(heroBrandNames));

const verifiedBanners: readonly HeroBannerItem[] = Object.freeze([
  {
    id: "organic-magnesium",
    slot: "top-left",
    title: "Szerves magnézium",
    subtitle: "B6- és D3-vitaminnal",
    description: "JutaVit",
    href: "/search?q=magn%C3%A9zium",
    cta: "Kínálat megtekintése",
    mobileCta: "Megnézem",
    image: "https://cdn.shopify.com/s/files/1/0993/2849/1903/files/magn.jpg?v=1775209421",
    imageAlt: "JutaVit Szerves magnézium B6- és D3-vitaminnal",
    bgColor: "#386a65",
  },
  {
    id: "adult-multivitamin",
    slot: "top-center",
    title: "Multivitamin felnőtteknek",
    subtitle: "Vitaminok egyetlen készítményben",
    description: "JutaVit · 45 filmtabletta",
    href: "/search?q=multivitamin",
    cta: "Kínálat megtekintése",
    mobileCta: "Megnézem",
    image: "https://cdn.shopify.com/s/files/1/0993/2849/1903/files/IMG_0917_ca83c2d8-30f1-463a-892d-f0e9dd6197a7.jpg?v=1775209374",
    imageAlt: "JutaVit Multivitamin felnőtteknek, 45 filmtabletta",
    bgColor: "#415e4c",
    isPrimary: true,
  },
  {
    id: "omega-three",
    slot: "top-right",
    title: "Omega-3",
    subtitle: "1200 mg halolaj + E-vitamin",
    description: "JutaVit · 100 kapszula",
    href: "/search?q=omega-3",
    cta: "Kínálat megtekintése",
    mobileCta: "Megnézem",
    image: "https://cdn.shopify.com/s/files/1/0993/2849/1903/files/omegaharomjut_90a7b780-d49e-449b-8d8a-6e1ee6ef516d.png?v=1775209379",
    imageAlt: "JutaVit Omega-3, 1200 mg halolajjal és E-vitaminnal, 100 kapszula",
    bgColor: "#31586b",
  },
  {
    id: "c-vitamin",
    slot: "bottom-wide",
    title: "C-vitamin 1000 mg",
    subtitle: "Csipkebogyóval, D3-vitaminnal és cinkkel",
    description: "JutaVit · 100 db",
    href: "/search?q=C-vitamin",
    cta: "Kínálat megtekintése",
    mobileCta: "Megnézem",
    image: "https://cdn.shopify.com/s/files/1/0993/2849/1903/files/jutavitcsipkbogyo_8ec01859-85be-48bc-a4c7-aeaba917dece.jpg?v=1775209339",
    imageAlt: "JutaVit C-vitamin 1000 mg csipkebogyóval, D3-vitaminnal és cinkkel, 100 darab",
    bgColor: "#a65d2d",
  },
  {
    id: "d-three-vitamin",
    slot: "bottom-small-1",
    title: "D3-vitamin Forte",
    subtitle: "4000 NE",
    description: "JutaVit · 100 tabletta",
    href: "/search?q=D-vitamin",
    cta: "Kínálat megtekintése",
    mobileCta: "Megnézem",
    image: "https://cdn.shopify.com/s/files/1/0993/2849/1903/files/jutavitdharomnagy_35a902fd-5e1b-4047-ba2c-d581cf150370.jpg?v=1775209347",
    imageAlt: "JutaVit D3-vitamin Forte 4000 NE, 100 tabletta",
    bgColor: "#7a6330",
  },
  {
    id: "vegan-probiotics",
    slot: "bottom-small-2",
    title: "Probiotics",
    subtitle: "Vegán készítmény",
    description: "Your Vitamin Healthy Life",
    href: "/search?q=probiotikum",
    cta: "Kínálat megtekintése",
    mobileCta: "Megnézem",
    image: "https://cdn.shopify.com/s/files/1/0993/2849/1903/files/probiotics-416x624_3b0a0d13-4189-467d-a701-945d7b51dbe3.jpg?v=1775209605",
    imageAlt: "Your Vitamin Healthy Life Probiotics vegán készítmény",
    bgColor: "#506b45",
  },
  {
    id: "collagen-complex",
    slot: "bottom-small-3",
    title: "Kollagén komplex",
    subtitle: "JutaVit",
    description: "60 filmtabletta",
    href: "/search?q=kollag%C3%A9n",
    cta: "Kínálat megtekintése",
    mobileCta: "Megnézem",
    image: "https://cdn.shopify.com/s/files/1/0993/2849/1903/files/kollagen_9b3aa9ca-979d-4bfd-9a7f-3568d5e1ba2d.png?v=1775209421",
    imageAlt: "JutaVit Kollagén komplex, 60 filmtabletta",
    bgColor: "#74566b",
  },
]);

export function getHeroBanners(handle: string): readonly HeroBannerItem[] {
  const safeHandle = handle in heroBrandNames ? handle : "arvoalux";
  return verifiedBanners.map((banner) =>
    banner.isPrimary ? { ...banner, brandHandle: safeHandle } : banner,
  );
}
