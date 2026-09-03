import { defineBrand } from "@arvoalux/core";

const fonts =
  "https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Manrope:wght@400;500;600;700&display=swap";

export const brand = defineBrand({
  handle: "biobarat",
  name: "BioBarát",
  tagline: "Egészség, természetesen.",
  domains: ["biobarat.eu", "www.biobarat.eu"],
  collectionHandle: "brand-biobarat",
  theme: {
    bg: "#F4EFE5",
    surface: "#FFFFFF",
    fg: "#1D2922",
    muted: "#587064",
    accent: "#1F5D42",
    accentFg: "#FFFFFF",
    radius: "12px",
    fontHref: fonts,
    fontDisplay: "'Lora', serif",
    fontBody: "'Manrope', sans-serif",
  },
});
