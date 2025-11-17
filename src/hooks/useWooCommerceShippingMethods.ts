import { useQuery } from "@tanstack/react-query";
import { functionsFetch } from "@/lib/http/supabaseFunctions";

export type ShippingMethod = {
  instance_id: number;
  method_id: string; // 'flat_rate' | 'free_shipping'
  title: string;
  cost: number; // 0 for free
};

export const useWooCommerceShippingMethods = (zoneId?: number | null) => {
  return useQuery<ShippingMethod[]>({
    queryKey: ["woocommerce-shipping-methods", zoneId],
    queryFn: async ({ signal }) => {
      if (zoneId == null) return [];
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
      try {
        if (!supabaseUrl || !anon) {
          // Fallback to free shipping when env is missing
          return [{ instance_id: 0, method_id: "free_shipping", title: "Free shipping", cost: 0 }];
        }
        const url = `/woocommerce-shipping-methods?zone_id=${zoneId}`;
        const res = await functionsFetch(url, { signal });
        if (!res.ok) {
          console.warn("Shipping methods fetch failed, using free shipping fallback.");
          return [{ instance_id: 0, method_id: "free_shipping", title: "Free shipping", cost: 0 }];
        }
        const data = await res.json();
        const list = (Array.isArray(data) ? data : []) as ShippingMethod[];
        return list.length > 0 ? list : [{ instance_id: 0, method_id: "free_shipping", title: "Free shipping", cost: 0 }];
      } catch (err) {
        console.warn("Shipping methods fetch error, using free shipping fallback:", err);
        return [{ instance_id: 0, method_id: "free_shipping", title: "Free shipping", cost: 0 }];
      }
    },
    enabled: zoneId != null,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
