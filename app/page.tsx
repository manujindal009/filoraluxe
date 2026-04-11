import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTABanner } from "@/components/home/CTABanner";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <TestimonialsSection />
      <CTABanner />
    </>
  );
}
