import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { functionsFetch } from '@/lib/http/supabaseFunctions';

export interface WooCommerceAddress {
  id: string;
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
  email?: string;
  is_default?: boolean;
}

export type BillingAddressInput = Omit<WooCommerceAddress, 'id' | 'is_default'>;

export const useWooCommerceAddresses = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['woocommerce-addresses', user?.id],
    queryFn: async () => {
        if (!user) throw new Error('User not authenticated');
        const response = await functionsFetch(`/woocommerce-addresses?customer_id=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
        const data = await response.json();
        return [data.billing, data.shipping];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateWooCommerceBillingAddress = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
      mutationFn: async (billing: BillingAddressInput) => {
        if (!user) throw new Error('User not authenticated');
        const res = await functionsFetch(`/woocommerce-addresses`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ customer_id: user.id, billing }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to save address');
        }
        return await res.json();
      },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['woocommerce-addresses', user?.id] });
    },
  });
};
