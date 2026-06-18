import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeading({
  title,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="text-center mb-8">
      <h2 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 mb-2">{title}</h2>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-0.5 text-gray-500 hover:text-brand text-[15px] transition-colors"
        >
          {ctaLabel}
          <ChevronRight className="w-5 h-5 text-brand" />
        </Link>
      )}
    </div>
  );
}
