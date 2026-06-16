import { defineBrand } from "@arvoalux/core";

const fonts =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Nunito+Sans:wght@400;600&display=swap";

export const brand = defineBrand({
  handle: "biobarat",
  name: "BioBarát",
  tagline: "A természet a legjobb barátod.",
  domains: ["biobarat.eu", "www.biobarat.eu"],
  collectionHandle: "brand-biobarat",
  theme: {
    bg: "#faf6ec",
    surface: "#ffffff",
    fg: "#2c3a2e",
    muted: "#71806f",
    accent: "#4c8f3f",
    accentFg: "#ffffff",
    radius: "18px",
    fontHref: fonts,
    fontDisplay: "'Fraunces', serif",
    fontBody: "'Nunito Sans', sans-serif",
  },
});
