import { useQuery } from "@tanstack/react-query";

export type CurrencyPosition = "left" | "right" | "left_space" | "right_space";

export interface WooCommerceCurrency {
  code: string;
  symbol: string;
  position: CurrencyPosition;
  decimals: number;
}

const FALLBACK: WooCommerceCurrency = {
  code: "USD",
  symbol: "$",
  position: "left",
  decimals: 2,
};

export const useWooCommerceCurrency = () => {
  return useQuery({
    queryKey: ["woocommerce-currency-settings"],
    queryFn: async ({ signal }) => {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Missing Supabase env vars, using fallback currency settings.");
        return FALLBACK;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/woocommerce-settings`, {
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch WooCommerce settings (${response.status})`);
      }

      const payload = await response.json();

      const code = String(payload.currencyCode ?? payload.currency ?? FALLBACK.code).toUpperCase();
      const symbol = String(payload.currencySymbol ?? payload.symbol ?? FALLBACK.symbol);
      const rawPosition = String(payload.currencyPosition ?? payload.position ?? FALLBACK.position).toLowerCase();
      const position: CurrencyPosition =
        rawPosition === "left" ||
        rawPosition === "left_space" ||
        rawPosition === "right" ||
        rawPosition === "right_space"
          ? rawPosition
          : FALLBACK.position;

      const decimalsCandidate = Number(payload.decimals ?? payload.currencyDecimals ?? FALLBACK.decimals);
      const decimals = Number.isFinite(decimalsCandidate) && decimalsCandidate >= 0 ? Math.floor(decimalsCandidate) : FALLBACK.decimals;

      return {
        code,
        symbol,
        position,
        decimals,
      } satisfies WooCommerceCurrency;
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
