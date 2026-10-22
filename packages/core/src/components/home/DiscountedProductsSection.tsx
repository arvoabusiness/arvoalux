import type { Brand } from "../../types";
import { loadPromotions } from "../../promotions";
import { PaginatedProductGrid } from "../product/PaginatedProductGrid";
import { SectionHeading } from "./SectionHeading";
export async function DiscountedProductsSection({ brand }: { brand: Brand }) {
  const {products} = await loadPromotions(brand.handle);
  if (!products.length) return null;
  return <section className="py-12 md:py-16 bg-gray-50" data-testid="discounted-products-section">
    <div className="max-w-7xl mx-auto px-4">
      <SectionHeading title="Kiárusítás!" ctaLabel="Mutasd az összeset" ctaHref="/akciok" />
      <PaginatedProductGrid products={products} brandHandle={brand.handle} pageSize={6} />
    </div>
  </section>;
}
