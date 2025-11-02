import { useQuery } from '@tanstack/react-query';

interface WooCommerceProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  rating: number;
  inStock: boolean;
  description: string;
  fullDescription?: string;
  images?: string[];
  brand?: string;
  attributes?: { name?: string; options?: string[] }[];
}

interface UseWooCommerceProductsOptions {
  category?: string;
  slug?: string;
  search?: string;
  per_page?: number;
  enabled?: boolean;
}

export const useWooCommerceProducts = (options: UseWooCommerceProductsOptions = {}) => {
  return useQuery({
    queryKey: ['woocommerce-products', options.category, options.slug, options.search, options.per_page],
    queryFn: async ({ signal }) => {
      // Build query string for the URL
      let url = '/woocommerce-products';
      const params = new URLSearchParams();
      
      if (options.category) params.append('category', options.category);
      if (options.slug) params.append('slug', options.slug);
      if (options.search) params.append('search', options.search);
      if (options.per_page) params.append('per_page', String(options.per_page));
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      // Get the Supabase project URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const fullUrl = `${supabaseUrl}/functions/v1${url}`;

      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      return data as WooCommerceProduct[];
    },
    enabled: options.enabled !== false && (!options.search || options.search.length >= 0),
    // When fetching a single product by slug, always refetch on mount and don't use long stale time
    staleTime: options.slug ? 0 : 5 * 60 * 1000,
    refetchOnMount: options.slug ? 'always' : false,
    refetchOnWindowFocus: false,
  });
};
