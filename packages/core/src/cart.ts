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

const cartCookie = (brandHandle: string) => `cartId_${brandHandle}`;

export async function addToCart(formData: FormData) {
  const variantId = String(formData.get("variantId"));
  const brandHandle = String(formData.get("brand"));
  const quantity = Math.max(1, Number(formData.get("quantity")) || 1);
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
    cart = data.cartCreate.cart;
    jar.set(cartCookie(brandHandle), cart.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
  }

  revalidatePath("/cart");
  redirect("/cart");
}

export async function updateCartLine(formData: FormData) {
  const brandHandle = String(formData.get("brand"));
  const lineId = String(formData.get("lineId"));
  const quantity = Number(formData.get("quantity"));
  const jar = await cookies();
  const cartId = jar.get(cartCookie(brandHandle))?.value;
  if (!cartId) return;

  // Quantity 0 → remove the line entirely.
  if (quantity <= 0) {
    await storefront(
      brandHandle,
      CART_LINES_REMOVE,
      { cartId, lineIds: [lineId] },
      { noStore: true }
    );
  } else {
    await storefront(
      brandHandle,
      CART_LINES_UPDATE,
      { cartId, lines: [{ id: lineId, quantity }] },
      { noStore: true }
    );
  }
  revalidatePath("/cart");
}

export async function removeCartLine(formData: FormData) {
  const brandHandle = String(formData.get("brand"));
  const lineId = String(formData.get("lineId"));
  const jar = await cookies();
  const cartId = jar.get(cartCookie(brandHandle))?.value;
  if (!cartId) return;

  await storefront(
    brandHandle,
    CART_LINES_REMOVE,
    { cartId, lineIds: [lineId] },
    { noStore: true }
  );
  revalidatePath("/cart");
}

export async function getCart(brandHandle: string): Promise<Cart | null> {
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
