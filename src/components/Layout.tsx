import HeaderPrimary from "./HeaderPrimary";
import HeaderSecondary from "./HeaderSecondary";
import Footer from "./Footer";
import WhatsAppFAB from "./WhatsAppFAB";
import BottomNav from "./BottomNav";
import FloatingCart from "./FloatingCart";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";
import FaviconSetter from "./FaviconSetter";
import { useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  // Ensure global top padding equals header offset on devices where the header is fixed (mobile)
  useEffect(() => {
    const update = () => {
      const header = document.querySelector('[data-header-primary]') as HTMLElement | null;
      if (!header) return;
      const style = window.getComputedStyle(header);
      const isFixed = style.position === "fixed";
      const offset = isFixed ? header.offsetHeight : 0;
      document.documentElement.style.setProperty("--app-header-offset", `${offset}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <CartDrawerProvider>
      <div className="min-h-screen flex flex-col">
        <FaviconSetter />
  {/* Notice bar removed as requested */}
        <HeaderPrimary />
  <HeaderSecondary />
  {/* Add top padding equal to header height on small screens to avoid overlap */}
  <main className="flex-1 pb-20 md:pb-0" style={{ paddingTop: "var(--app-header-offset, 0px)" }}>{children}</main>
        <Footer />
        <WhatsAppFAB />
        <FloatingCart />
        <BottomNav />
      </div>
    </CartDrawerProvider>
  );
};

export default Layout;
