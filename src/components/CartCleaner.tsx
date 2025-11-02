import { useEffect } from 'react';
import { getCart, saveCart } from '@/utils/cart';

/**
 * Component to clean up old cart data with invalid product IDs
 * This runs once on app mount to remove products with 'p' prefix IDs
 */
export const CartCleaner = () => {
  useEffect(() => {
    const cart = getCart();
    
    // Filter out items with invalid IDs (old static data with 'p' prefix)
    const validCart = cart.filter(item => {
      const cleanId = item.id.toString().replace(/^p/, '');
      const isValid = !isNaN(parseInt(cleanId, 10)) && parseInt(cleanId, 10) > 0;
      
      if (!isValid) {
        console.log('Removing invalid cart item:', item.id, item.name);
      }
      
      return isValid;
    });
    
    // If we removed any items, update the cart
    if (validCart.length !== cart.length) {
      console.log(`Cleaned ${cart.length - validCart.length} invalid items from cart`);
      saveCart(validCart);
    }
  }, []);
  
  return null;
};
