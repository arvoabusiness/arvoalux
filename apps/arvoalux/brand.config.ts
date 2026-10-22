import { defineBrand } from "@arvoalux/core";

export const brand = defineBrand({
  handle: "arvoalux",
  name: "Arvoa Lux",
  tagline: "Prémium wellness, mindennap.",
  domains: ["arvoalux.hu", "www.arvoalux.hu"],
  collectionHandle: "brand-arvoalux",
  theme: {
    bg: "#F6F3EA",
    surface: "#FFFFFF",
    fg: "#1D2522",
    muted: "#70877E",
    accent: "#2F4B43",
    accentFg: "#FFFFFF",
    radius: "12px",
    fontHref: "/fonts/lato.css",
    fontDisplay: "'Lato', sans-serif",
    fontBody: "'Lato', sans-serif",
  },
});
