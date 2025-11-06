import { Link } from "react-router-dom";
import { useWooCommerceCategories } from "@/hooks/useWooCommerceCategories";
import { useWooCommerceProducts } from "@/hooks/useWooCommerceProducts";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";

const Categories = () => {
  const { data: categories, isLoading: categoriesLoading } = useWooCommerceCategories();
  const { data: products, isLoading: productsLoading } = useWooCommerceProducts();

  const popularProducts = (products || [])
    .filter((p) => typeof p.discount === "number" && p.discount > 20)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 8);

  const isLoadingPopular = productsLoading || (popularProducts.length === 0 && productsLoading);

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-accent">Home</Link>
            <span>/</span>
            <span>Categories</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading">All Categories</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Browse every department and discover new favorites</p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {categoriesLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/9] w-full rounded-xl" />
              </div>
            ))
          ) : (
            categories?.map((category) => (
              <Link
                to={`/category/${category.slug}`}
                key={category.id}
                className="block group relative overflow-hidden rounded-xl"
              >
                <div className="relative aspect-[16/9]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 z-10" />
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end text-white">
                    <h3 className="text-lg md:text-xl font-semibold font-heading">
                      {category.name}
                    </h3>
                    <p className="text-xs md:text-sm text-white/80 mt-1">{category.count} Products</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Popular Products */}
        <div>
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-1">Popular Products</h2>
              <p className="text-muted-foreground text-sm md:text-base">Top picks customers love right now</p>
            </div>
            <Link to="/shop" className="hidden md:block text-sm text-accent hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoadingPopular ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            ) : (
              (popularProducts.length ? popularProducts : (products || []).slice(0, 8)).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
