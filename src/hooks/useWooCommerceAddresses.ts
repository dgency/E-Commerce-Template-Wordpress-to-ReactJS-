import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, token } = useAuth();

  return useQuery({
    queryKey: ['woocommerce-addresses', user?.id],
    queryFn: async () => {
        if (!user) throw new Error('User not authenticated');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/woocommerce-addresses?customer_id=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });
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

export async function addOrUpdateBillingAddress(userId: string, token: string, billing: BillingAddressInput) {
  const url = `https://dgency.net/wp-json/wc/v3/customers/${userId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ billing }),
  });
  if (!response.ok) {
    throw new Error('Failed to add/update billing address');
  }
  return await response.json();
}

export const useUpdateWooCommerceBillingAddress = () => {
  const { user, token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
      mutationFn: async (billing: BillingAddressInput) => {
        if (!user) throw new Error('User not authenticated');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const res = await fetch(`${supabaseUrl}/functions/v1/woocommerce-addresses`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
