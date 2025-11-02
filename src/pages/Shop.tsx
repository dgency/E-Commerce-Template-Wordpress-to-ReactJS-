import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useWooCommerceProducts } from "@/hooks/useWooCommerceProducts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const Shop = () => {
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState({});
  const { data: products, isLoading, error } = useWooCommerceProducts(filters);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getSortedProducts = () => {
    if (!products) return [];
    const sorted = [...products];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        sorted.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    return sorted;
  };

  const sortedProducts = getSortedProducts();

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Error loading products</h2>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Top heading container */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading mb-2">All Products</h1>
          <p className="text-muted-foreground">Showing {sortedProducts.length} products</p>
        </div>
        {/* Main content: sidebar + products */}
        <div className="flex gap-8">
          {/* Sidebar (desktop only) */}
          {isDesktop && (
            <FilterSidebar onFilterChange={setFilters} />
          )}
          <div className="flex-1">
            {/* Sort by and Filter button row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="discount">Best Discount</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
                {/* Filter button beside Sort by (mobile/tablet only) */}
                {!isDesktop && (
                  <Button
                    variant="outline"
                    className="ml-2 shadow-sm rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200"
                    onClick={() => setDrawerOpen(true)}
                  >
                    Filter
                  </Button>
                )}
              </div>
            </div>
            {/* Drawer for filters (mobile/tablet only) */}
            {!isDesktop && (
              <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent
                  side="left"
                  className="
                    w-72 max-w-full p-0
                    bg-gradient-to-b from-white via-gray-50 to-gray-100
                    rounded-xl shadow-md transition-all duration-300
                    [&>button[data-radix-dialog-close]]:hidden  // 👈 hide shadcn's default X
                  "
                  style={{ padding: 0, overflowY: "auto" }}
                >
                  <div className="h-full px-4 pt-4 pb-0">
                    <FilterSidebar
                      onFilterChange={setFilters}
                      drawerOpen={drawerOpen}
                      setDrawerOpen={setDrawerOpen}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
            {/* Product grid with negative top margin for alignment */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 -mt-3">
              {isLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))
              ) : (
                sortedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
