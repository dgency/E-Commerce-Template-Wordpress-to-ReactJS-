import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { functionsFetch } from '@/lib/http/supabaseFunctions';

export interface WooCommerceWishlistItem {
  id: string;
  product_id: string;
  name: string;
  image: string;
  price: number;
  inStock: boolean;
}

export const useWooCommerceWishlist = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['woocommerce-wishlist', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const url = `/woocommerce-wishlist?customer_id=${user.id}`;
      const response = await functionsFetch(url);
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
