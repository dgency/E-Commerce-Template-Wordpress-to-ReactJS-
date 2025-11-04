import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface WooCommerceAddress {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  email?: string;
}

interface WooCommerceOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    image: string;
  }>;
  billing: WooCommerceAddress;
  shipping: WooCommerceAddress;
  paymentMethod: string;
}

export const useWooCommerceOrders = () => {
  const { user, token } = useAuth();

  return useQuery({
    queryKey: ['woocommerce-orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/functions/v1/woocommerce-orders?customer_id=${user.id}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      return data as WooCommerceOrder[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
