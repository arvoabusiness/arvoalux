"use client";

import { useState } from "react";
import { ShoppingBag, Minus, Plus } from "lucide-react";
import { addToCart } from "../../cart";
import { formatPrice, type Money } from "../../catalog";

type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
};

export function AddToCartForm({
  brandHandle,
  variants,
  available,
}: {
  brandHandle: string;
  variants: Variant[];
  available: boolean;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const hasChoices = variants.length > 1;

  return (
    <form action={addToCart} className="space-y-6">
      <input type="hidden" name="brand" value={brandHandle} />
      <input type="hidden" name="variantId" value={variantId} />
      <input type="hidden" name="quantity" value={quantity} />

      {hasChoices && (
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Választható kiszerelés</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const active = v.id === variantId;
              return (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  disabled={!v.availableForSale}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors disabled:opacity-40 ${
                    active ? "border-brand bg-brand-50 text-brand font-semibold" : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {v.title} — {formatPrice(v.price.amount, v.price.currencyCode)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-200 rounded-xl">
          <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-12 w-12 flex items-center justify-center text-gray-700 hover:bg-gray-50 rounded-l-xl" aria-label="Csökkentés">
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
          <button type="button" onClick={() => setQuantity((q) => q + 1)} className="h-12 w-12 flex items-center justify-center text-gray-700 hover:bg-gray-50 rounded-r-xl" aria-label="Növelés">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!available || !variantId}
          className="flex-1 h-12 bg-brand hover:bg-brand-dark text-brand-fg font-bold text-base rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40"
          data-testid="add-to-cart-btn"
        >
          <ShoppingBag className="w-5 h-5" />
          {available ? "Kosárba" : "Elfogyott"}
        </button>
      </div>
    </form>
  );
}
