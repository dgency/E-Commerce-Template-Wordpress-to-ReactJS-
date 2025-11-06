import HeroSlider from "@/components/HeroSlider";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWooCommerceProducts } from "@/hooks/useWooCommerceProducts";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  // Fetch only products from the "Hot Deals" category for the Best Deals section
  const { data: hotDeals, isLoading: isHotDealsLoading } = useWooCommerceProducts({
    category: "hot-deals",
    per_page: 8,
  });

  // Fetch general products for Featured section
  const { data: products, isLoading: isProductsLoading } = useWooCommerceProducts({ per_page: 12 });
  const featuredProducts = products ? products.slice(0, 12) : [];

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Popular Categories */}
      <CategoryCarousel />

      {/* Best Deals Section */}
      <section className="py-16 bg-gradient-to-b from-background to-background-muted">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-2">
                🔥 Best Deals
              </h2>
              <p className="text-muted-foreground">Limited time offers you can't miss</p>
            </div>
            <Link to="/category/hot-deals" className="hidden md:block">
              <Button variant="outline" className="rounded-full px-6">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isHotDealsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            ) : (
              (hotDeals ?? []).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked favorites just for you</p>
            </div>
            <Link to="/shop" className="hidden md:block">
              <Button variant="outline" className="rounded-full px-6">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isProductsLoading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button size="lg" className="btn-gradient rounded-full px-8 py-6 text-lg shadow-xl">
                Explore All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
