import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { CartCleaner } from "./components/CartCleaner";
import Layout from "./components/Layout";
const Index = lazy(() => import("./pages/Index"));
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Category = lazy(() => import("./pages/Category"));
const Categories = lazy(() => import("./pages/Categories"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const WishlistPage = lazy(() => import("./pages/Wishlist.tsx"));
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <AuthProvider>
      <WishlistProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CartCleaner />
        <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Loading…</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/category" element={<Categories />} />
                <Route path="/category/:slug" element={<Category />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth/login" element={<Auth />} />
                <Route path="/auth/signup" element={<Auth />} />
                <Route path="/account" element={<Account />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
      </WishlistProvider>
      </AuthProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;
