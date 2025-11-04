// HeaderPrimary.tsx
import { Search, User, ShoppingCart, Phone, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { themeConfig } from "@/config/theme.config";
import { Button } from "./ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import CartDrawer from "./CartDrawer";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { GlobalSearch } from "@/components/search/GlobalSearch"; // 👈 use the modern search
import { useSiteBrand } from "@/contexts/SiteBrandContext";

const HeaderPrimary = () => {
  const { cartItemCount } = useCart();
  const { user, logout } = useAuth();
  const { isOpen, setIsOpen } = useCartDrawer();
  const brand = useSiteBrand() || {};

  // Responsive sticky navbar: sticky for desktop/tablet, hide on scroll down for mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dropdown state for account menu
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  // Close dropdown on outside click
  useEffect(() => {
    if (!accountDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".account-dropdown-trigger") && !target.closest(".account-dropdown-menu")) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [accountDropdownOpen]);

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
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.name || "Site Logo"}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <h1 className="text-2xl font-bold font-heading text-gradient">
                {brand.name || themeConfig.brandName}
              </h1>
            )}
          </Link>

          {/* Search (desktop) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <GlobalSearch
              className="w-full"
              placeholder="Search products, categories..."
            />
          </div>

          {/* Actions: phone, cart, login/account (at end) */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Contact Phone - always first */}
            <a
              href={`tel:${themeConfig.contactPhone}`}
              className="hidden lg:flex items-center gap-2 text-sm hover:text-accent transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span className="font-medium">{themeConfig.contactPhone}</span>
            </a>

            {/* Cart - always middle */}
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

            {/* Login/Account - always last */}
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 flex items-center account-dropdown-trigger"
                  onClick={() => setAccountDropdownOpen((open) => !open)}
                  aria-expanded={accountDropdownOpen}
                  aria-haspopup="menu"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline font-semibold">Account</span>
                  <svg className={`ml-1 h-3 w-3 text-muted-foreground transition-transform ${accountDropdownOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                </Button>
                {/* Dropdown menu on click */}
                {accountDropdownOpen && (
                  <div className="account-dropdown-menu absolute right-0 mt-2 min-w-[180px] flex flex-col bg-white border border-border rounded-lg shadow-lg py-2 animate-fade-in z-50">
                    <Link to="/account" onClick={() => setAccountDropdownOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium">Profile</span>
                      </Button>
                    </Link>
                    <Link to="/track-order" onClick={() => setAccountDropdownOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-4 py-2 text-left hover:bg-blue-100 hover:text-blue-700 rounded-md transition-colors">
                        <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3"/></svg>
                        <span className="font-medium">Track Order</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { logout(); setAccountDropdownOpen(false); }}
                      className="w-full justify-start gap-2 px-4 py-2 text-left hover:bg-red-100 hover:text-red-700 rounded-md transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2 text-red-500" />
                      <span className="font-medium">Logout</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Login</span>
                </Button>
              </Link>
            )}
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
