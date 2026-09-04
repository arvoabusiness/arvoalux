import { defineBrand } from "@arvoalux/core";

const fonts =
  "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap";

export const brand = defineBrand({
  handle: "arvoalux",
  name: "Arvoalux",
  tagline: "Egészség, jól választva.",
  domains: ["arvoalux.hu", "www.arvoalux.hu"],
  logoSrc: "/arvoa-lux-logo-forest.png",
  logoAlt: "Arvoa Lux",
  collectionHandle: "brand-arvoalux",
  theme: {
    bg: "#F6F3EA",
    surface: "#FFFFFF",
    fg: "#1D2522",
    muted: "#70877E",
    accent: "#2F4B43",
    accentFg: "#FFFFFF",
    radius: "12px",
    fontHref: fonts,
    fontDisplay: "'Lato', sans-serif",
    fontBody: "'Lato', sans-serif",
  },
});
