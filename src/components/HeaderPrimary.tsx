// HeaderPrimary.tsx
import { Search, User, ShoppingCart, Phone, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { themeConfig } from "@/config/theme.config";
import { Button } from "./ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import CartDrawer from "./CartDrawer";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { GlobalSearch } from "@/components/search/GlobalSearch"; // 👈 use the modern search

const HeaderPrimary = () => {
  const { cartItemCount } = useCart();
  const { user, logout } = useAuth();
  const { isOpen, setIsOpen } = useCartDrawer();

  // Responsive sticky navbar: sticky for desktop/tablet, hide on scroll down for mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`border-b bg-background z-50 transition-transform duration-300 w-full
        ${isMobile ? "fixed top-0" : "lg:sticky lg:top-0 lg:z-50 lg:h-16"}
        ${isMobile ? (scrollDirection === "down" ? "-translate-y-full" : "translate-y-0") : "translate-y-0"}`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold font-heading text-gradient">
              {themeConfig.brandName}
            </h1>
          </Link>

          {/* Search (desktop) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <GlobalSearch
              className="w-full"
              placeholder="Search products, categories..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Contact Phone */}
            <a
              href={`tel:${themeConfig.contactPhone}`}
              className="hidden lg:flex items-center gap-2 text-sm hover:text-accent transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="font-medium">{themeConfig.contactPhone}</span>
            </a>

            {/* Login/Account */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/account">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">{user.displayName}</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden md:inline">Logout</span>
                </Button>
              </div>
            ) : (
              <Link to="/auth/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 relative"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="hidden md:inline">Cart</span>
            </Button>
          </div>
        </div>

        {/* Search (mobile) */}
        <div className="mt-4 md:hidden">
          <GlobalSearch
            className="w-full"
            placeholder="Search products, categories..."
          />
        </div>
      </div>

      {/* Single shared cart drawer */}
      <CartDrawer open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
};

export default HeaderPrimary;
