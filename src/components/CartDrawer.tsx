import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartItemCount } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center">
            <SheetTitle className="text-2xl font-bold font-heading">
              Shopping Cart ({cartItemCount})
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Cart Content */}
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-semibold mb-1">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add some products to get started!
              </p>
              <SheetClose asChild>
                <Link to="/shop">
                  <Button className="btn-gradient">
                    Continue Shopping
                  </Button>
                </Link>
              </SheetClose>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <Link 
                    to={`/product/${item.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/product/${item.slug}`}
                      onClick={() => onOpenChange(false)}
                    >
                      <h4 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                    </Link>
                    <p className="text-primary font-bold text-sm mt-1">
                      {formatCurrency(item.price)}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-destructive hover:text-destructive/80 transition-colors p-1.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - Summary and Actions */}
            <div className="border-t px-6 py-4 space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary text-xl">
                  {formatCurrency(cartTotal)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <SheetClose asChild>
                  <Link to="/checkout" className="block">
                    <Button size="lg" className="w-full btn-gradient">
                      Checkout
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/cart" className="block">
                    <Button variant="outline" size="lg" className="w-full">
                      View Cart
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
