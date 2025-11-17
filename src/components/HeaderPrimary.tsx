// HeaderPrimary.tsx
import { User, ShoppingCart, Phone, LogOut, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { themeConfig } from "@/config/theme.config";
import { Button } from "./ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import CartDrawer from "./CartDrawer";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { GlobalSearch } from "@/components/search/GlobalSearch"; // 👈 use the modern search
import { prefetchAccount, prefetchAuth, prefetchTrackOrder } from "@/lib/prefetch";
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

  const headerRef = useRef<HTMLDivElement | null>(null);
  const [topThreshold, setTopThreshold] = useState(0);
  const [nearTop, setNearTop] = useState(true);

  // Expose header height via CSS var for layout spacing on mobile
  useEffect(() => {
    const setHeaderOffset = () => {
      const el = headerRef.current;
      if (!el) return;
      const style = window.getComputedStyle(el);
      const isFixed = style.position === "fixed";
      const offset = isFixed ? el.offsetHeight : 0;
      document.documentElement.style.setProperty("--app-header-offset", `${offset}px`);
      document.documentElement.style.setProperty("--primary-header-height", `${el.offsetHeight}px`);
      setTopThreshold(offset || 56); // use header height as hide/show threshold
    };
    setHeaderOffset();
    window.addEventListener("resize", setHeaderOffset);
    return () => window.removeEventListener("resize", setHeaderOffset);
  }, []);

  // Track if we are near the very top; if so, force header visible
  useEffect(() => {
    const onScroll = () => {
      const y = window.pageYOffset || 0;
      setNearTop(y <= Math.max(0, topThreshold - 1));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [topThreshold]);

  return (
    <div
      ref={headerRef}
      data-header-primary
      className={`border-b bg-background z-50 transition-transform duration-300 w-full shadow-sm
        ${isMobile ? "fixed top-0" : "sticky top-0"}
        ${isMobile ? (nearTop ? "translate-y-0" : (scrollDirection === "down" ? "-translate-y-full" : "translate-y-0")) : "translate-y-0"}`}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
          {/* Logo (always use local /images/logo.svg) */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
            <img
              src="/images/logo.svg"
              alt={brand.name || themeConfig.brandName || "Site Logo"}
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain"
              onError={(e) => {
                // Fallback to text if logo fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('h1')) {
                  const h1 = document.createElement('h1');
                  h1.className = 'text-2xl font-bold font-heading text-gradient';
                  h1.textContent = brand.name || themeConfig.brandName;
                  parent.appendChild(h1);
                }
              }}
            />
          </Link>

          {/* Search (desktop & tablet) */}
          <div className="flex-1 max-w-2xl hidden md:block mx-4 lg:mx-6">
            <GlobalSearch
              className="w-full"
              placeholder="Search products, categories..."
            />
          </div>

          {/* Actions: phone, cart, login/account (at end) */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 shrink-0">
            {/* Contact Phone - desktop only */}
            <a
              href={`tel:${themeConfig.contactPhone}`}
              className="hidden xl:flex items-center gap-2 text-sm hover:text-accent transition-colors px-2"
            >
              <Phone className="h-4 w-4" />
              <span className="font-medium">{themeConfig.contactPhone}</span>
            </a>

            {/* Cart - responsive */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 sm:gap-2 relative px-2 sm:px-3"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-accent text-accent-foreground text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
              <span className="hidden sm:inline text-sm">Cart</span>
            </Button>

            {/* Login/Account - responsive */}
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 sm:gap-2 flex items-center account-dropdown-trigger px-2 sm:px-3"
                  onClick={() => setAccountDropdownOpen((open) => !open)}
                  aria-expanded={accountDropdownOpen}
                  aria-haspopup="menu"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline font-semibold text-sm">Account</span>
                  <svg className={`hidden sm:block ml-1 h-3 w-3 text-muted-foreground transition-transform ${accountDropdownOpen ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
                </Button>
                {/* Dropdown menu on click */}
                {accountDropdownOpen && (
                  <div className="account-dropdown-menu absolute right-0 mt-2 min-w-[180px] flex flex-col bg-white border border-border rounded-lg shadow-lg py-2 animate-fade-in z-50">
                    <Link to="/account" onClick={() => setAccountDropdownOpen(false)} onMouseEnter={prefetchAccount}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-4 py-2 text-left hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                        <User className="h-4 w-4 mr-2" />
                        <span className="font-medium">Profile</span>
                      </Button>
                    </Link>
                    <Link to="/account?tab=wishlist" onClick={() => setAccountDropdownOpen(false)} onMouseEnter={prefetchAccount}>
                      <Button variant="ghost" size="sm" className="w-full justify-start gap-2 px-4 py-2 text-left hover:bg-pink-100 hover:text-pink-700 rounded-md transition-colors">
                        <Heart className="h-4 w-4 mr-2 text-pink-500" />
                        <span className="font-medium">Wishlist</span>
                      </Button>
                    </Link>
                    <Link to="/track-order" onClick={() => setAccountDropdownOpen(false)} onMouseEnter={prefetchTrackOrder}>
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
              <Link to="/auth/login" onMouseEnter={prefetchAuth}>
                <Button variant="ghost" size="sm" className="gap-1.5 sm:gap-2 px-2 sm:px-3">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline text-sm">Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search (mobile only) */}
        <div className="mt-3 md:hidden">
          <GlobalSearch
            className="w-full"
            placeholder="Search products..."
          />
        </div>
      </div>

      {/* Single shared cart drawer */}
      <CartDrawer open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
};

export default HeaderPrimary;
