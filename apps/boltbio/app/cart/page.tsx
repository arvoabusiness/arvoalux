import { CartPage } from "@arvoalux/core";
import { brand } from "@/brand.config";

export const dynamic = "force-dynamic";

export default function Page() {
  return <CartPage brand={brand} />;
}
