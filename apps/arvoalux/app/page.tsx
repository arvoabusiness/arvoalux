import { HomePage } from "@arvoalux/core";
import { brand } from "@/brand.config";

export const revalidate = 300;
export const metadata = {alternates:{canonical:"https://www.arvoalux.hu/"}};

export default function Page() {
  return <HomePage brand={brand} />;
}
