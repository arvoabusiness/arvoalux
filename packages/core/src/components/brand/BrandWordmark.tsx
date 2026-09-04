import Link from "next/link";

/**
 * Generic, theme-driven brand wordmark used in the header/footer/popup.
 * Renders the brand name in the brand display font with a brand-coloured
 * underline — works for any brand (Arvoalux, BioBarát, …) without a custom SVG.
 */
export function BrandWordmark({
  name,
  logoSrc,
  logoAlt,
  size = "md",
  link = true,
}: {
  name: string;
  logoSrc?: string;
  logoAlt?: string;
  size?: "sm" | "md" | "lg";
  link?: boolean;
}) {
  const sizes = {
    sm: { text: "text-lg", line: "mt-0.5 h-[1.5px]" },
    md: { text: "text-2xl", line: "mt-1 h-[2px]" },
    lg: { text: "text-3xl", line: "mt-1 h-[2px]" },
  } as const;
  const s = sizes[size] ?? sizes.md;

  const logoWidths = { sm: "w-[112px]", md: "w-[160px]", lg: "w-[200px]" } as const;
  const mark = (
    <span className="inline-flex items-center" data-testid="brand-wordmark">
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={logoAlt ?? name}
          className={`${logoWidths[size]} h-auto max-h-12 object-contain object-left`}
        />
      ) : (
        <span className="inline-flex flex-col">
          <span className={`${s.text} font-heading font-extrabold tracking-[0.08em] text-brand leading-none uppercase`}>
            {name}
          </span>
          <span className={`${s.line} w-full bg-brand rounded-full`} />
        </span>
      )}
    </span>
  );

  if (!link) return mark;
  return (
    <Link href="/" className="inline-flex" data-testid="logo-link">
      {mark}
    </Link>
  );
}
