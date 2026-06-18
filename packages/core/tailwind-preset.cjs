/**
 * Shared Tailwind preset for every brand app.
 *
 * Brand-colored utilities (`bg-brand`, `text-brand`, `border-brand`, …) resolve
 * to the per-brand `--accent` CSS variable that `BrandLayout` injects on <html>.
 * That's what makes one shared design recolor itself for each brand: change the
 * accent in `brand.config.ts` and the whole UI follows. Hover/tint shades are
 * derived from the same variable with `color-mix`, so a brand only ever sets one
 * accent colour. Neutral chrome (white, grays, the dark `ink` bar) is structural
 * and stays fixed across brands.
 */

// Lets `bg-brand/40`, `text-brand-fg/90`, `ring-brand/30` etc. apply alpha to a
// CSS variable colour (Tailwind v3 can't do that for a plain var string).
const withAlpha = (expr) => ({ opacityValue }) =>
  opacityValue === undefined
    ? expr
    : `color-mix(in srgb, ${expr} calc(${opacityValue} * 100%), transparent)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-display)", "Manrope", "sans-serif"],
        body: ["var(--font-body)", "Inter", "sans-serif"],
      },
      colors: {
        // Per-brand accent, driven by --accent (set in BrandLayout from brand.config.ts)
        brand: {
          DEFAULT: withAlpha("var(--accent)"),
          fg: withAlpha("var(--accent-fg)"),
          dark: "color-mix(in srgb, var(--accent) 82%, #000)",
          darker: "color-mix(in srgb, var(--accent) 66%, #000)",
          muted: "color-mix(in srgb, var(--accent) 55%, #fff)",
          50: "color-mix(in srgb, var(--accent) 7%, #fff)",
          100: "color-mix(in srgb, var(--accent) 14%, #fff)",
          200: "color-mix(in srgb, var(--accent) 26%, #fff)",
          border: "color-mix(in srgb, var(--accent) 22%, #fff)",
        },
        // Structural dark chrome (utility bar, search button) — shared across brands
        ink: {
          DEFAULT: "#2d2d2d",
          dark: "#1a1a1a",
        },
      },
      borderRadius: {
        brand: "var(--radius)",
      },
      keyframes: {
        "slide-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-badge": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.3s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-in-left": "slide-in-left 0.25s ease-out forwards",
        "pulse-badge": "pulse-badge 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
