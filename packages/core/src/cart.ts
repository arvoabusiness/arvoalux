"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  storefront,
  CART_CREATE,
  CART_LINES_ADD,
  CART_LINES_UPDATE,
  CART_LINES_REMOVE,
  CART_QUERY,
  type Cart,
} from "./shopify";

function assertBrand(brand: string) {
  if (process.env.NEXT_PUBLIC_ARVOALUX_COMMERCE === "1" && brand !== "arvoalux") throw new Error("Invalid commerce brand");
}
function assertQuantity(quantity: number, minimum: number) {
  if (process.env.NEXT_PUBLIC_ARVOALUX_COMMERCE === "1" && (!Number.isInteger(quantity) || quantity < minimum || quantity > 250)) throw new Error("Invalid cart quantity");
}
function assertResult(result: { cart: Cart | null; userErrors?: unknown[] }) {
  if (process.env.NEXT_PUBLIC_ARVOALUX_COMMERCE === "1" && (!result?.cart || result.userErrors?.length)) throw new Error("Cart operation rejected");
}

const cartCookie = (brandHandle: string) => `cartId_${brandHandle}`;

export async function addToCart(formData: FormData) {
  if (process.env.NEXT_PUBLIC_ARVOALUX_REVIEW_ONLY === "1") throw new Error("Commerce disabled");
  const variantId = String(formData.get("variantId"));
  const brandHandle = String(formData.get("brand"));
  assertBrand(brandHandle);
  const inputQuantity = Number(formData.get("quantity"));
  assertQuantity(inputQuantity, 1);
  const quantity = Math.max(1, inputQuantity || 1);
  const jar = await cookies();
  const existing = jar.get(cartCookie(brandHandle))?.value;

  let cart: Cart | null = null;

  if (existing) {
    const data = await storefront<{ cartLinesAdd: { cart: Cart | null } }>(
      brandHandle,
      CART_LINES_ADD,
      { cartId: existing, lines: [{ merchandiseId: variantId, quantity }] },
      { noStore: true }
    );
    assertResult(data.cartLinesAdd);
    cart = data.cartLinesAdd.cart;
  }

  if (!cart) {
    const data = await storefront<{ cartCreate: { cart: Cart } }>(
      brandHandle,
      CART_CREATE,
      {
        lines: [{ merchandiseId: variantId, quantity }],
        attributes: [{ key: "brand", value: brandHandle }],
      },
      { noStore: true }
    );
    assertResult(data.cartCreate);
    cart = data.cartCreate.cart;
    jar.set(cartCookie(brandHandle), cart.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
      ...(process.env.NEXT_PUBLIC_ARVOALUX_COMMERCE === "1" ? { httpOnly: true, secure: true, sameSite: "lax" as const } : {}),
    });
  }

  revalidatePath("/cart");
  redirect("/cart");
}

export async function updateCartLine(formData: FormData) {
  if (process.env.NEXT_PUBLIC_ARVOALUX_REVIEW_ONLY === "1") throw new Error("Commerce disabled");
  const brandHandle = String(formData.get("brand"));
  assertBrand(brandHandle);
  const lineId = String(formData.get("lineId"));
  const quantity = Number(formData.get("quantity"));
  assertQuantity(quantity, 0);
  const jar = await cookies();
  const cartId = jar.get(cartCookie(brandHandle))?.value;
  if (!cartId) return;

  const data = await storefront<Record<string, { cart: Cart | null; userErrors?: unknown[] }>>(
    brandHandle,
    quantity <= 0 ? CART_LINES_REMOVE : CART_LINES_UPDATE,
    quantity <= 0 ? { cartId, lineIds: [lineId] } : { cartId, lines: [{ id: lineId, quantity }] },
    { noStore: true }
  );
  assertResult(data[quantity <= 0 ? "cartLinesRemove" : "cartLinesUpdate"]);
  revalidatePath("/cart");
}

export async function removeCartLine(formData: FormData) {
  if (process.env.NEXT_PUBLIC_ARVOALUX_REVIEW_ONLY === "1") throw new Error("Commerce disabled");
  const brandHandle = String(formData.get("brand"));
  assertBrand(brandHandle);
  const lineId = String(formData.get("lineId"));
  const jar = await cookies();
  const cartId = jar.get(cartCookie(brandHandle))?.value;
  if (!cartId) return;

  const data = await storefront<{ cartLinesRemove: { cart: Cart | null; userErrors?: unknown[] } }>(
    brandHandle,
    CART_LINES_REMOVE,
    { cartId, lineIds: [lineId] },
    { noStore: true }
  );
  assertResult(data.cartLinesRemove);
  revalidatePath("/cart");
}

export async function getCart(brandHandle: string): Promise<Cart | null> {
  assertBrand(brandHandle);
  if (process.env.NEXT_PUBLIC_ARVOALUX_REVIEW_ONLY === "1") return null;
  const jar = await cookies();
  const id = jar.get(cartCookie(brandHandle))?.value;
  if (!id) return null;
  try {
    const data = await storefront<{ cart: Cart | null }>(brandHandle, CART_QUERY, { id }, {
      noStore: true,
    });
    return data.cart;
  } catch {
    return null;
  }
}
