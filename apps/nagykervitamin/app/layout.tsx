import { BrandLayout } from "@arvoalux/core";
import "@arvoalux/core/styles.css";
import { brand } from "@/brand.config";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <BrandLayout brand={brand}>{children}</BrandLayout>;
}
