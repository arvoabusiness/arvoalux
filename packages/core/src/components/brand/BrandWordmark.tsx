import Link from "next/link";

/**
 * Generic, theme-driven brand wordmark used in the header/footer/popup.
 * Renders the brand name in the brand display font with a brand-coloured
 * underline — works for any brand (Arvoalux, BioBarát, …) without a custom SVG.
 */
export function BrandWordmark({
  name,
  brandHandle,
  size = "md",
  link = true,
}: {
  name: string;
  brandHandle?: string;
  size?: "sm" | "md" | "lg";
  link?: boolean;
}) {
  const sizes = {
    sm: { text: "text-lg", line: "mt-0.5 h-[1.5px]" },
    md: { text: "text-2xl", line: "mt-1 h-[2px]" },
    lg: { text: "text-3xl", line: "mt-1 h-[2px]" },
  } as const;
  const s = sizes[size] ?? sizes.md;

  const mark = brandHandle === "arvoalux" ? (
    // Supplied owner-approved asset, not a re-typeset approximation.
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/arvoa-lux-forest.png" alt="Arvoa Lux" data-testid="brand-wordmark"
      className={`arvoalux-logo arvoalux-logo-${size}`} />
  ) : (
    <span className="inline-flex flex-col" data-testid="brand-wordmark">
      <span className={`${s.text} font-heading font-extrabold tracking-[0.08em] text-brand leading-none uppercase`}>
        {name}
      </span>
      <span className={`${s.line} w-full bg-brand rounded-full`} />
    </span>
  );

  if (!link) return mark;
  return (
    <Link href="/" className="inline-flex" data-testid="logo-link">
      {mark}
    </Link>
  );
}
