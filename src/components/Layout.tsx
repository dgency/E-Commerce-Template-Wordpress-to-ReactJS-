import NoticeBar from "./NoticeBar";
import HeaderPrimary from "./HeaderPrimary";
import HeaderSecondary from "./HeaderSecondary";
import Footer from "./Footer";
import WhatsAppFAB from "./WhatsAppFAB";
import BottomNav from "./BottomNav";
import FloatingCart from "./FloatingCart";
import { CartDrawerProvider } from "@/contexts/CartDrawerContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <CartDrawerProvider>
      <div className="min-h-screen flex flex-col">
        <NoticeBar />
        <HeaderPrimary />
  <HeaderSecondary />
  {/* Remove margin-top so content sits directly below category menu */}
  <main className="flex-1 pb-20 md:pb-0 mt-0">{children}</main>
        <Footer />
        <WhatsAppFAB />
        <FloatingCart />
        <BottomNav />
      </div>
    </CartDrawerProvider>
  );
};

export default Layout;
