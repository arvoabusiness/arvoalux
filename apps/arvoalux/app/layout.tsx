import Script from "next/script";
import { ga4Consent } from "./ga4-consent";
import { BrandLayout } from "@arvoalux/core";
import "@arvoalux/core/styles.css";
import "./owner-hero.css";
import "./category-parity.css";
import { brand } from "@/brand.config";
export const metadata = { title: "Arvoa Lux — Prémium wellness, mindennap.", metadataBase: new URL("https://www.arvoalux.hu"), robots: { index: true, follow: true } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <BrandLayout brand={brand}><Script id="arvoalux-ga4-consent" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: ga4Consent }} />{children}</BrandLayout>;
}
