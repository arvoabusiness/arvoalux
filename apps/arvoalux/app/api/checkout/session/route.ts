import {checkoutRoute} from "@arvoalux/core/checkout";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=60;
export async function POST(req:Request){return checkoutRoute(req,"create");}
