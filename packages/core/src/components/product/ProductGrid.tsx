import { ProductCard } from "./ProductCard";
import { Skeleton } from "../ui/skeleton";
import { sellable, type ProductCard as ProductCardData } from "../../catalog";

export function ProductGrid({
  products,
  brandHandle,
  loading,
  className = "",
}: {
  products?: ProductCardData[];
  brandHandle: string;
  loading?: boolean;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-brand border border-gray-100 overflow-hidden">
            <Skeleton className="aspect-square" />
            <div className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = sellable(products ?? []);
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nincs megjeleníthető termék</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}
      data-testid="product-grid"
    >
      {items.map((product) => (
        <ProductCard key={product.id} product={product} brandHandle={brandHandle} />
      ))}
    </div>
  );
}
