import { useQuery } from '@tanstack/react-query';
import { functionsFetch } from '@/lib/http/supabaseFunctions';

interface WooCommerceCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  count: number;
}

interface UseWooCommerceCategoriesOptions {
  search?: string;
  per_page?: number;
  enabled?: boolean;
}

export const useWooCommerceCategories = (options: UseWooCommerceCategoriesOptions = {}) => {
  return useQuery({
    queryKey: ['woocommerce-categories', options.search, options.per_page],
    queryFn: async ({ signal }) => {
      // Get the Supabase project URL
          let url = "/woocommerce-categories";
      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.per_page) params.append('per_page', String(options.per_page));
      const qs = params.toString();
      if (qs) url += `?${qs}`;

          const response = await functionsFetch(url, { signal });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      return data as WooCommerceCategory[];
    },
    enabled: options.enabled !== false && (!options.search || options.search.length >= 0),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
