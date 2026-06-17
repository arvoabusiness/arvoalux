import { HomePage } from "@arvoalux/core";
import { brand } from "@/brand.config";

export const revalidate = 300;

export default function Page() {
  return <HomePage brand={brand} />;
}
