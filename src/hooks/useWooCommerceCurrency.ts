import { useQuery } from "@tanstack/react-query";

export type CurrencyPosition = "left" | "right" | "left_space" | "right_space";

export interface WooCommerceCurrencySettings {
  currencyCode: string;
  currencySymbol: string;
  currencyPosition: CurrencyPosition;
  thousandSeparator: string;
  decimalSeparator: string;
  decimals: number;
}

const fallbackSettings: WooCommerceCurrencySettings = {
  currencyCode: "USD",
  currencySymbol: "$",
  currencyPosition: "left",
  thousandSeparator: ",",
  decimalSeparator: ".",
  decimals: 2,
};

export const useWooCommerceCurrency = () => {
  return useQuery({
    queryKey: ["woocommerce-currency-settings"],
    queryFn: async ({ signal }) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

      if (!supabaseUrl) {
        console.warn("Missing VITE_SUPABASE_URL env, falling back to default currency settings");
        return fallbackSettings;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/woocommerce-settings`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        signal,
      });

      if (!response.ok) {
        console.warn("Failed to fetch WooCommerce currency settings, using defaults");
        return fallbackSettings;
      }

      const data = (await response.json()) as Partial<WooCommerceCurrencySettings>;

      return {
        ...fallbackSettings,
        ...data,
      } satisfies WooCommerceCurrencySettings;
    },
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
