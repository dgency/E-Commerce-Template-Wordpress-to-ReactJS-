import { useQuery } from "@tanstack/react-query";
import { functionsFetch } from "@/lib/http/supabaseFunctions";

export type ShippingZone = {
  id: number;
  name: string;
};

export const useWooCommerceShippingZones = () => {
  return useQuery<ShippingZone[]>({
    queryKey: ["woocommerce-shipping-zones"],
    queryFn: async ({ signal }) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
      try {
        if (!supabaseUrl || !anon) {
          console.warn("Missing Supabase env vars, using default zone fallback.");
          return [{ id: 0, name: "Default Zone" }];
        }
        const res = await functionsFetch(`/woocommerce-shipping-zones`, { signal });
        if (!res.ok) {
          console.warn("Shipping zones fetch failed, using default fallback zone.");
          return [{ id: 0, name: "Default Zone" }];
        }
        const data = await res.json();
        const list = (Array.isArray(data) ? data : []) as ShippingZone[];
        return list.length > 0 ? list : [{ id: 0, name: "Default Zone" }];
      } catch (err) {
        console.warn("Shipping zones fetch error, using fallback:", err);
        return [{ id: 0, name: "Default Zone" }];
      }
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
