// Lightweight route prefetch helpers for React.lazy() chunks
// These are safe no-ops if the chunk is already loaded.

export const prefetchIndex = () => import("../pages/Index");
export const prefetchShop = () => import("../pages/Shop");
export const prefetchProductDetail = () => import("../pages/ProductDetail");
export const prefetchCategory = () => import("../pages/Category");
export const prefetchCart = () => import("../pages/Cart");
export const prefetchCheckout = () => import("../pages/Checkout");
export const prefetchThankYou = () => import("../pages/ThankYou");
export const prefetchContact = () => import("../pages/Contact");
export const prefetchAuth = () => import("../pages/Auth");
export const prefetchAccount = () => import("../pages/Account");
export const prefetchNotFound = () => import("../pages/NotFound");
export const prefetchTrackOrder = () => import("../pages/TrackOrder");

// Optional generic prefetch by path hint
export function prefetchByPath(path: string) {
  if (path.startsWith("/shop")) return prefetchShop();
  if (path.startsWith("/product/")) return prefetchProductDetail();
  if (path.startsWith("/category/")) return prefetchCategory();
  if (path.startsWith("/cart")) return prefetchCart();
  if (path.startsWith("/checkout")) return prefetchCheckout();
  if (path.startsWith("/thank-you")) return prefetchThankYou();
  if (path.startsWith("/contact")) return prefetchContact();
  if (path.startsWith("/auth")) return prefetchAuth();
  if (path.startsWith("/account")) return prefetchAccount();
  if (path.startsWith("/track-order")) return prefetchTrackOrder();
  if (path === "/") return prefetchIndex();
  return Promise.resolve();
}
