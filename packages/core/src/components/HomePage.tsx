import type { Brand } from "../types";
import { HeroBanner } from "./home/HeroBanner";
import { HomepageCategorySection } from "./category/HomepageCategorySection";
import { DeliveryInfoBar } from "./home/DeliveryInfoBar";
import { FeaturedProductsSection } from "./home/FeaturedProductsSection";
import { DiscountedProductsSection } from "./home/DiscountedProductsSection";
import { HealthCategoriesSection } from "./home/HealthCategoriesSection";
import { BlogSection } from "./home/BlogSection";

export function HomePage({ brand }: { brand: Brand }) {
  return (
    <div data-testid="home-page">
      <HeroBanner />
      <HomepageCategorySection brand={brand} />
      <DeliveryInfoBar />
      <FeaturedProductsSection brand={brand} />
      <DiscountedProductsSection brand={brand} />
      <HealthCategoriesSection />
      <BlogSection />
    </div>
  );
}
