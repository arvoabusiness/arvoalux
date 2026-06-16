import { defineBrand } from "@arvoalux/core";

const fonts =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@300;400;500&display=swap";

export const brand = defineBrand({
  handle: "arvoalux",
  name: "Arvoalux",
  tagline: "Prémium wellness, mindennap.",
  domains: ["arvoalux.hu", "www.arvoalux.hu"],
  collectionHandle: "brand-arvoalux",
  theme: {
    bg: "#0e1f17",
    surface: "#16291f",
    fg: "#f2ead7",
    muted: "#9fb0a4",
    accent: "#d8b25c",
    accentFg: "#10130c",
    radius: "2px",
    fontHref: fonts,
    fontDisplay: "'Cormorant Garamond', serif",
    fontBody: "'Jost', sans-serif",
  },
});
