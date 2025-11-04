import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export interface WooCommerceWishlistItem {
  id: string;
  product_id: string;
  name: string;
  image: string;
  price: number;
  inStock: boolean;
}

export const useWooCommerceWishlist = () => {
  const { user, token } = useAuth();

  return useQuery({
    queryKey: ['woocommerce-wishlist', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      // Replace with your WooCommerce REST API endpoint for wishlist
      const url = `${supabaseUrl}/functions/v1/woocommerce-wishlist?customer_id=${user.id}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      const data = await response.json();
      return data as WooCommerceWishlistItem[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
