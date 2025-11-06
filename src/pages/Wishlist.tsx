import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";

const Wishlist = () => {
  const { items, clear } = useWishlist();

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading">My Wishlist</h1>
            <p className="text-sm md:text-base text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={clear} className="rounded-full">Clear All</Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="mb-4">Your wishlist is empty.</p>
            <Link to="/shop">
              <Button className="btn-gradient rounded-full px-6">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
