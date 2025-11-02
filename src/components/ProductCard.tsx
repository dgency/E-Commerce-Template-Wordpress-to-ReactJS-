import { Star, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating?: number;
  inStock?: boolean;
}

const ProductCard = ({
  id,
  name,
  slug,
  price,
  originalPrice,
  discount,
  image,
  rating = 0,
  inStock = true,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { formatCurrency } = useCurrency();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Validate product ID is numeric (from WooCommerce)
    const cleanId = id.toString().replace(/^p/, '');
    if (isNaN(parseInt(cleanId, 10))) {
      toast.error('Invalid product. Please refresh the page.');
      return;
    }
    
    addToCart({ id: cleanId, name, price, image, slug });
    toast.success(`${name} added to cart!`);
  };

  return (
    <div className="group relative bg-card rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-primary/20">
      <Link to={`/product/${slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Discount Badge */}
          {discount && discount > 0 && (
            <div className="absolute top-1.5 left-1.5 md:top-3 md:left-3 bg-accent text-accent-foreground text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg animate-scale-in">
              -{discount}%
            </div>
          )}
          
          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm md:text-lg">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-2.5 md:p-4 lg:p-5">
        <Link to={`/product/${slug}`}>
          <h3 className="font-semibold font-heading mb-1.5 md:mb-2 hover:text-primary transition-colors line-clamp-2 text-xs md:text-sm lg:text-base leading-tight">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex items-center gap-0.5 md:gap-1 mb-2 md:mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-2.5 w-2.5 md:h-3.5 md:w-3.5 ${
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted"
                }`}
              />
            ))}
            <span className="text-[10px] md:text-xs text-muted-foreground ml-0.5 md:ml-1 font-medium">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-baseline gap-1.5 md:gap-2 mb-2.5 md:mb-4">
          <span className="text-base md:text-xl lg:text-2xl font-bold text-primary">
            {formatCurrency(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-[10px] md:text-xs lg:text-sm text-muted-foreground line-through">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button - Modern Gradient Style */}
        <Button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full gap-1 md:gap-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-semibold shadow-md hover:shadow-lg transition-colors h-8 md:h-10 lg:h-11 ${
            inStock
              ? "border border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
              : ""
          }`}
          variant={inStock ? "outline" : "secondary"}
        >
          <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
