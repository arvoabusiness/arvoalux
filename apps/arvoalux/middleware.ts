import { NextResponse } from "next/server";
// Preserve the existing request boundary; index only canonical public presentation routes.
export const config = { matcher: ["/:path*"] };
const headers = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store, max-age=0",
  "X-Arvoa-Browsing": "20261006",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};
function requestBoundary(request: Request) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (["/api/checkout/session","/api/checkout/status","/api/checkout/webhook"].includes(path) && request.method === "POST" && !request.headers.has("next-action")) return;
  if (path === "/api/withdrawal" && request.method === "POST" && !request.headers.has("next-action")) return;
  if (path === "/api/cart" && ["GET","POST"].includes(request.method) && !request.headers.has("next-action")) return;
  if (path === "/commerce-cart.css" && ["GET","HEAD"].includes(request.method)) return;

  if (path.startsWith("/api/auth/") && ["GET","POST"].includes(request.method) && !request.headers.has("next-action")) return;
  if (!["GET", "HEAD"].includes(request.method) || request.headers.has("next-action")) {
    return new Response("Method not allowed", { status: 405, headers: { ...headers, Allow: "GET, HEAD" } });
  }
  if (["/google-merchant.xml", "/sitemap.xml"].includes(path)) return;
  // Read-only customer presentation routes; the global write rejection above remains intact.
  if(path === "/hirlevel/megerosites") return;
  if (["/login","/login/register","/login/reset","/account","/account/profile","/account/addresses","/account/newsletter","/account/wishlist","/account/orders","/api/auth/get-session"].includes(path)) return;
  if (["/sutik","/panaszkezeles","/legal/ASZF-arvoalux-aszf-20261013-v1.pdf"].includes(path)) return;
  // Exact first-party copies of the owner-approved hero photographs.
  if (["/owner-hero/vitamins.jpg", "/owner-hero/routine.jpg", "/owner-hero/skincare.jpg"].includes(path)) return;
  // Exact immutable description images copied without changing their contents.
  if ([
    "/description-media/0876ebc5b0332cd3295f65eb062dcf8a68ee14268614885b60304961f3770065.png",
    "/description-media/002e92bc04c72c28e76d68687b9a4c6c9a3824b7f45b6ad39bd504abb80f350b.png",
    "/description-media/053cfee5482414459f6d1fed30b5799dbeecfbb050b1158ec8f2651490f8d90f.png",
    "/description-media/070a271d42d90face8514d9c4fd4dff77c4e9083ff2f0f748bbdbc56b217e5b3.png",
    "/description-media/0901bdd224c70fc21bdf2ea88faca66061501b07630afee305ed597fcac35985.png",
    "/description-media/15938c151630dcf57edc8bcb0885e415e7ff7d212c7d3f3ad415e2bc70cf6e05.png",
    "/description-media/29356d18771e87d52e0ebd9587e0b1159fcb36f765ee9704d853152ad0a6335a.jpg",
    "/description-media/2ce14c956a3dfe574a2488cb1eda4c547e1791dc61f983e2e1351065e9b42c39.png",
    "/description-media/2f3aa2d5f70f884a715e0c9b4bb73bddcf59b35fe08985acf76946ec3845ca23.jpg",
    "/description-media/38bddce7cc00bf6792dff8b4049151343cf03dab54ede2b98a9a845a133018e4.png",
    "/description-media/4e497fde9ca8657d756fc4047ee4bb7f1e8e6e09b43f348bf199811987ec1df6.png",
    "/description-media/5a3dc761a3c843acf8c10259405eed8d0946201438d6438e5c1fca9ba81bb496.png",
    "/description-media/5c35ce25e9f219aef5b7956e9d7063488d700d0c66e004b3d26905e9eb27329e.jpg",
    "/description-media/657240367f855d2e629a0661ab3ee572dddf79d3fcef558b397cb2f2329f80ba.png",
    "/description-media/670d964e0e891cdc268bcd23efaa352a6232be99f18d9bd5af578e467deaf74f.gif",
    "/description-media/6a83cd3163796e0bd6c0a6bed5d0bd673f64f10b1af7ecf828ef99e7b1f3abdf.png",
    "/description-media/6f0e2084ad24dd02ed3ef62495bb21ca08b541eb8524d322efb63eca41b50cb0.jpg",
    "/description-media/826ded1795dbbcd28e885033d10bfba155e5531efa3d42041f39d09d78753131.png",
    "/description-media/827df3c2b003ef1cfdbb3b4348b1878aba40c20f0bc9db74289242b412170e66.png",
    "/description-media/84444612f628fb99a58dbbc630c050265846ced731bf45f396fa3b2523274361.jpg",
    "/description-media/975c1ea904b3e62261b9fa515d6a7ae98d936458b17b032367ab816d11d45f28.png",
    "/description-media/b82c01fadd7f9c7bd256f8b56eb91502d190808cd4d5458cb73fe970f69fae62.png",
    "/description-media/bd293fdd135c7f19c25ce13bc99fc400fd59b3a4e9cdef22108bb0fee5cb6b0f.png",
    "/description-media/bd9de0437613f468a9c85434bcd54e08dbe8090b05732579087a3ae2ebd0a347.png",
    "/description-media/c4d7f0ca124b9186da9aa64cdcf66ed7563b9129f7d22111c1566fc9894d9a2d.png",
    "/description-media/db133ba0053c24797e9b271cbc8d603345eb74df84b38c47ee68b1c81eb01d1e.png",
    "/description-media/dc4a208e1d786edc2e1e498aa13dbe392609f398588e912c6af12b2a8bd1e1f9.png",
    "/description-media/ddcad7ea43036f0710d48808c0665abcf0a8a5bce591387a1b0aa990659d0a17.jpg",
    "/description-media/df1672bda6684b95b0f6619a108674acdb145b0be9fe54a7e7ab5fe1d77079d9.png",
    "/description-media/df37f27ed30bc941198f9835f3947e183f43befedd4634cb0915df5ffb5d9ce4.png",
    "/description-media/e85993c021a5ccde12acaa5c136c69e5c67d84daca1f4095e0e773e17352cfa3.png",
    "/description-media/ea22256d31cd74ce98550da6da7a9715c2ca3de8d678dc13df1d51b001b067c6.png",
    "/description-media/ee57b3c2505c0a883478de57c1bc91f50fccedbd56962523d575766f507a4188.png",
    "/description-media/f3bd0d1f560d669722974d556f0f092f72a84c17727a10b486ce302eab216b17.png",
    "/description-media/f7fd2645eaa6c4a84bca371de124d462e13ddac27e9b5df54aec4f74d7371859.png",
    "/description-media/f81b93ab3c6201841cd520fa718f47bba3015b4bedb8355efe78e9b4ab54fa1f.png"
].includes(path)) return;
  // Exact local approved identity assets; no general public-directory bypass.
  if (["/fonts/lato.css", "/fonts/Lato-Regular.ttf", "/fonts/Lato-Medium.ttf",
       "/fonts/Lato-Semibold.ttf", "/fonts/Lato-Bold.ttf", "/fonts/Lato-Heavy.ttf",
       "/fonts/Lato-Black.ttf", "/brand/arvoa-lux-forest.png"].includes(path)) return;
  if (["/category-banners/wellness.png","/category-banners/skincare.png","/category-banners/essentials.png","/category-banners/family.png","/category-banners/pets.png"].includes(path)) return;
  if (path === "/cart") return;
  if (["/checkout","/checkout-ui/index.html","/checkout-ui/checkout.js","/checkout-ui/checkout.css","/checkout-ui/leaflet.css"].includes(path)) return;
  if (path === "/" || path === "/magazin" || path === "/adatkezeles" || path === "/aszf" || path === "/search" || path === "/akciok" || path === "/api/search" || path === "/elallas" || path === "/shipping-payment" ||
      /^\/(collections|products|categories)\/[a-zA-Z0-9_-]+\/?$/.test(path) ||
      /^\/info\/(contact|about|order-process|company|returns)\/?$/.test(path) ||
      /^\/_next\/static\/[a-zA-Z0-9_./%\[\]-]+$/.test(path) ||
      /^\/(favicon\.ico|robots\.txt)$/.test(path)) return;
  return new Response("Not found", { status: 404, headers });
}

export function middleware(request: Request) {
  const response = requestBoundary(request) || NextResponse.next();
  const url = new URL(request.url);
  const host = (request.headers.get("host") || url.host).toLowerCase();
  const canonicalHost = ["arvoalux.hu", "www.arvoalux.hu"].includes(host);
  const publicPage = url.pathname === "/" || ["/akciok", "/magazin"].includes(url.pathname) || /^\/(products|collections|categories)\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname);
  response.headers.set("X-Robots-Tag", canonicalHost && publicPage ? "index, follow" : "noindex, nofollow, noarchive");
  return response;
}
