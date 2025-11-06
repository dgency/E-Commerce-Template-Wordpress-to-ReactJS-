import { useParams, Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useWooCommerceProducts } from "@/hooks/useWooCommerceProducts";
import { useWooCommerceCategories } from "@/hooks/useWooCommerceCategories";
import { Skeleton } from "@/components/ui/skeleton";

const Category = () => {
  const { slug } = useParams();
  const { data: categories, isLoading: categoriesLoading } = useWooCommerceCategories();
  const { data: categoryProducts, isLoading: productsLoading } = useWooCommerceProducts({ 
    category: slug,
    enabled: !!slug 
  });
  
  const category = categories?.find((c) => c.slug === slug);
  const isLoading = categoriesLoading || productsLoading;

  if (!isLoading && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <Link to="/shop">
            <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg">
              Back to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-accent">
              Home
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-accent">
              Shop
            </Link>
            <span>/</span>
            <span>{category?.name || 'Loading...'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-2">
            {category?.name || 'Loading...'}
          </h1>
          <p className="text-muted-foreground">
            {category?.description} · {categoryProducts?.length || 0} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : (
            categoryProducts?.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))
          )}
        </div>

        {!isLoading && categoryProducts?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              No products found in this category yet.
            </p>
            <Link to="/shop">
              <button className="px-6 py-3 bg-accent text-accent-foreground rounded-lg">
                Browse All Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
