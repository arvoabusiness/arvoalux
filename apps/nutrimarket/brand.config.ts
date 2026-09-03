import { defineBrand } from "@arvoalux/core";

export const brand = defineBrand({
  handle: "nutrimarket",
  name: "NutriMarket",
  tagline: "TODO: approved brand tagline",
  domains: ["nutrimarket.hu", "www.nutrimarket.hu"],
  collectionHandle: "brand-nutrimarket",
  theme: {
    bg: "#ffffff", surface: "#f5f5f5", fg: "#161616", muted: "#6b6b6b",
    accent: "#2f7d32", accentFg: "#ffffff", radius: "10px",
    fontHref: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap",
    fontDisplay: "'Inter', sans-serif", fontBody: "'Inter', sans-serif",
  },
});
