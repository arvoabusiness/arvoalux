import Link from "next/link";
import { ShoppingBag, Minus, Plus, Trash2, ExternalLink } from "lucide-react";
import type { Brand } from "../types";
import { getCart, updateCartLine, removeCartLine } from "../cart";
import { formatPrice } from "../shopify";

export async function CartPage({ brand }: { brand: Brand }) {
  const cart = await getCart(brand.handle);

  if (!cart || cart.totalQuantity === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-heading font-bold text-2xl text-gray-900 mb-2">A kosarad üres</h2>
          <p className="text-gray-600 mb-6">Nézz körül termékeink között és találd meg a számodra megfelelőt!</p>
          <Link href="/" className="inline-flex bg-brand hover:bg-brand-dark text-brand-fg font-semibold px-6 py-3 rounded-xl transition-colors">
            Termékek böngészése
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" data-testid="cart-page">
      <h1 className="font-heading font-bold text-2xl text-gray-900 mb-8">Kosár ({cart.totalQuantity} termék)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {cart.lines.nodes.map((line) => {
              const img = line.merchandise.image?.url ?? line.merchandise.product.featuredImage?.url ?? null;
              const variantTitle = line.merchandise.title !== "Default Title" ? line.merchandise.title : null;
              return (
                <div key={line.id} className="p-4 flex gap-4">
                  <Link href={`/products/${line.merchandise.product.handle}`} className="flex-shrink-0">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={line.merchandise.product.title} className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg bg-gray-50" />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${line.merchandise.product.handle}`}>
                      <h3 className="font-medium text-gray-900 hover:text-brand transition-colors line-clamp-2 text-sm sm:text-base">
                        {line.merchandise.product.title}
                      </h3>
                    </Link>
                    {variantTitle && <p className="text-xs text-gray-400 mt-0.5">{variantTitle}</p>}
                    <span className="font-bold text-brand text-sm mt-1 block">{formatPrice(line.merchandise.price.amount, line.merchandise.price.currencyCode)}</span>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <form action={updateCartLine}>
                          <input type="hidden" name="brand" value={brand.handle} />
                          <input type="hidden" name="lineId" value={line.id} />
                          <input type="hidden" name="quantity" value={line.quantity - 1} />
                          <button type="submit" className="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-l-lg" aria-label="Csökkentés">
                            <Minus className="w-3 h-3" />
                          </button>
                        </form>
                        <span className="w-8 text-center text-sm font-medium">{line.quantity}</span>
                        <form action={updateCartLine}>
                          <input type="hidden" name="brand" value={brand.handle} />
                          <input type="hidden" name="lineId" value={line.id} />
                          <input type="hidden" name="quantity" value={line.quantity + 1} />
                          <button type="submit" className="h-8 w-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-lg" aria-label="Növelés">
                            <Plus className="w-3 h-3" />
                          </button>
                        </form>
                      </div>
                      <form action={removeCartLine}>
                        <input type="hidden" name="brand" value={brand.handle} />
                        <input type="hidden" name="lineId" value={line.id} />
                        <button type="submit" className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg" aria-label="Eltávolítás">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="font-bold text-gray-900">{formatPrice(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-heading font-bold text-lg text-gray-900 mb-4">Összesítés</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Részösszeg</span>
                <span>{formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Összesen</span>
                  <span className="text-brand" data-testid="cart-total">{formatPrice(cart.cost.totalAmount.amount, cart.cost.totalAmount.currencyCode)}</span>
                </div>
              </div>
            </div>
            <a
              href={cart.checkoutUrl}
              className="w-full bg-brand hover:bg-brand-dark text-brand-fg font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
              data-testid="checkout-btn"
            >
              Tovább a fizetéshez
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
