import { ShoppingCart } from "lucide-react";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { useCart } from "@/hooks/useCart";
import { useCurrency } from "@/contexts/CurrencyContext";

const FloatingCart = () => {
  const { cartItemCount, cartTotal } = useCart();
  const { formatCurrency } = useCurrency();
  const { setIsOpen } = useCartDrawer();

  if (cartItemCount === 0) return null;

  return (
    <div className="fixed bottom-40 right-4 md:bottom-24 md:right-8 z-40 animate-scale-in">
      <div className="relative">
        {/* Cart Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative z-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-xl p-4 md:p-5 transition-colors flex items-center gap-3"
          aria-label="Open cart drawer"
        >
          <div className="relative flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 md:h-7 md:w-7" />
            <div className="hidden md:flex flex-col items-start text-left">
              <span className="text-xs opacity-90">Cart Total</span>
              <span className="text-lg font-bold">{formatCurrency(cartTotal)}</span>
            </div>
          </div>

          <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
            {cartItemCount}
          </span>
        </button>

        <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary opacity-30 animate-ping" />
      </div>
    </div>
  );
};

export default FloatingCart;
