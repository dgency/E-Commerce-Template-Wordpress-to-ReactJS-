import { useState, useEffect } from 'react';
import {
  getCart,
  addToCart as addToCartUtil,
  removeFromCart as removeFromCartUtil,
  updateCartItemQuantity as updateCartItemQuantityUtil,
  clearCart as clearCartUtil,
  getCartTotal,
  getCartItemCount,
  type CartItem,
} from '@/utils/cart';

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load cart on mount
    setCart(getCart());

    // Listen for cart updates
    const handleCartUpdate = (event: Event) => {
      const custom = event as CustomEvent<CartItem[]>;
      setCart(custom.detail);
    };

    window.addEventListener('cart-updated' as unknown as keyof WindowEventMap, handleCartUpdate as EventListener);

    return () => {
      window.removeEventListener('cart-updated' as unknown as keyof WindowEventMap, handleCartUpdate as EventListener);
    };
  }, []);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const updatedCart = addToCartUtil(item, quantity);
    setCart(updatedCart);
  };

  const removeFromCart = (itemId: string) => {
    const updatedCart = removeFromCartUtil(itemId);
    setCart(updatedCart);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const updatedCart = updateCartItemQuantityUtil(itemId, quantity);
    setCart(updatedCart);
  };

  const clearCart = () => {
    clearCartUtil();
    setCart([]);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal: getCartTotal(cart),
    cartItemCount: getCartItemCount(cart),
  };
};
