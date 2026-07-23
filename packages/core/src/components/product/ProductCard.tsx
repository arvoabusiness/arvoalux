import Link from "next/link";
import { ShoppingBag } from "lucide-react";
// Import the pure helpers/types from catalog (no `server-only`) so this card can
// render inside client components like PaginatedProductGrid.
import { formatPrice, discountPercent, type ProductCard as ProductCardData } from "../../catalog";
import { addToCart } from "../../cart";

/**
 * Product tile for grids. The whole card is a link to the PDP via an absolute
 * overlay anchor; the add-to-cart sits on top as its own server-action form, so
 * we never nest a <form> inside an <a>.
 */
export function ProductCard({
  product,
  brandHandle,
}: {
  product: ProductCardData;
  brandHandle: string;
}) {
  const discount = discountPercent(product);
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const variantId = product.variants.nodes[0]?.id;

  return (
    <div
      className="group relative product-card bg-white rounded-brand border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
      data-testid={`product-card-${product.handle}`}
    >
      <Link
        href={`/products/${product.handle}`}
        className="absolute inset-0 z-0"
        aria-label={product.title}
      />

      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}
        {discount && (
          <span
            className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md"
            data-testid="discount-badge"
          >
            -{discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {product.vendor && product.vendor.toLowerCase() !== brandHandle && (
          <span className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
            {product.vendor}
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-900 leading-tight mt-0.5 mb-2 line-clamp-2 group-hover:text-brand transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(price.amount, price.currencyCode)}
            </span>
            {compareAt && discount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(compareAt.amount, compareAt.currencyCode)}
              </span>
            )}
          </div>
          {variantId && (
            <form action={addToCart} className="relative z-10">
              <input type="hidden" name="variantId" value={variantId} />
              <input type="hidden" name="brand" value={brandHandle} />
              <input type="hidden" name="quantity" value="1" />
              <button
                type="submit"
                disabled={!product.availableForSale}
                className="w-9 h-9 rounded-full bg-brand hover:bg-brand-dark text-brand-fg flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-40"
                data-testid={`add-to-cart-${product.handle}`}
                aria-label="Kosárba"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
