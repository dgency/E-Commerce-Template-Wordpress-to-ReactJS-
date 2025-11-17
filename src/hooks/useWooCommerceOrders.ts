import { useQuery } from '@tanstack/react-query';
import { functionsFetch } from '@/lib/http/supabaseFunctions';
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
  const { user } = useAuth();

  return useQuery({
    queryKey: ['woocommerce-orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const url = `/woocommerce-orders?customer_id=${user.id}`;
      const response = await functionsFetch(url);

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
