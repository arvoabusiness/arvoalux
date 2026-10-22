import "server-only";
import { CustomerLogin } from "../../../../../packages/core/src/components/account/CustomerLogin";
import { configuration } from "../../../../../packages/core/src/auth/customer-auth.mjs";
import { brand } from "@/brand.config";
export const dynamic="force-dynamic";
export const metadata={title:`Belépés — ${brand.name}`,robots:{index:false,follow:false},referrer:"no-referrer"};
export default function Page(){return <CustomerLogin brandName={brand.name} enabled={configuration(brand.handle).ready} mode="register"/>;}
