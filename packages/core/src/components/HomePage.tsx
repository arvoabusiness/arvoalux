import type { Brand } from "../types";
import { HeroBanner } from "./home/HeroBanner";
import { HomepageCategorySection } from "./category/HomepageCategorySection";
import { DeliveryInfoBar } from "./home/DeliveryInfoBar";
import { FeaturedProductsSection } from "./home/FeaturedProductsSection";
import { DiscountedProductsSection } from "./home/DiscountedProductsSection";
import { HealthCategoriesSection } from "./home/HealthCategoriesSection";
import { MagazineNewsletter } from "./home/MagazineNewsletter";

export function HomePage({ brand }: { brand: Brand }) {
  return (
    <div data-testid="home-page">
      <HeroBanner brand={brand} />
      <HomepageCategorySection brand={brand} />
      {brand.handle !== "arvoalux" && <DeliveryInfoBar brandHandle={brand.handle} />}
      <FeaturedProductsSection brand={brand} />
      <DiscountedProductsSection brand={brand} />
      <HealthCategoriesSection brandHandle={brand.handle} />
      <MagazineNewsletter brand={brand} />
    </div>
  );
}
