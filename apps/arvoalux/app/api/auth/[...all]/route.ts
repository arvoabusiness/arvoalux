import "server-only";
import { handleCustomerAuth } from "../../../../../../packages/core/src/auth/customer-auth.mjs";
import { brand } from "@/brand.config";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=30;
export function GET(request:Request){return handleCustomerAuth(request,brand.handle);}
export function POST(request:Request){return handleCustomerAuth(request,brand.handle);}
