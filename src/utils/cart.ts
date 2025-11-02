/**
 * Shopping Cart Utilities
 * LocalStorage-based cart management
 */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
}

const CART_STORAGE_KEY = 'dgency_cart';

export const getCart = (): CartItem[] => {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    // Dispatch custom event for cart updates
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

export const addToCart = (item: Omit<CartItem, 'quantity'>, quantity = 1): CartItem[] => {
  const cart = getCart();
  const existingItem = cart.find((i) => i.id === item.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ ...item, quantity });
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (itemId: string): CartItem[] => {
  const cart = getCart().filter((item) => item.id !== itemId);
  saveCart(cart);
  return cart;
};

export const updateCartItemQuantity = (itemId: string, quantity: number): CartItem[] => {
  const cart = getCart();
  const item = cart.find((i) => i.id === itemId);

  if (item) {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    item.quantity = quantity;
    saveCart(cart);
  }

  return cart;
};

export const clearCart = (): void => {
  saveCart([]);
};

export const getCartTotal = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

export const getCartItemCount = (cart: CartItem[]): number => {
  return cart.reduce((count, item) => count + item.quantity, 0);
};
