import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useWooCommerceCurrency, type WooCommerceCurrency, type CurrencyPosition } from "@/hooks/useWooCommerceCurrency";
import { setCurrencyFormatter } from "@/utils/currency";

type CurrencyContextValue = {
  code: string;
  symbol: string;
  position: CurrencyPosition;
  decimals: number;
  format: (amount: number) => string;
  formatCurrency: (amount: number) => string;
  loading: boolean;
  error?: string;
};

const FALLBACK_CURRENCY: WooCommerceCurrency = {
  code: "USD",
  symbol: "$",
  position: "left",
  decimals: 2,
};

const createFormatter = ({ symbol, position, decimals, code }: WooCommerceCurrency) => {
  const numberFormatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const resolvedSymbol = symbol || code;

  return (amount: number) => {
    const isNegative = amount < 0;
    const absolute = Number.isFinite(amount) ? Math.abs(amount) : 0;
    const numeric = numberFormatter.format(absolute);

    let formatted: string;
    switch (position) {
      case "left_space":
        formatted = `${resolvedSymbol} ${numeric}`;
        break;
      case "right":
        formatted = `${numeric}${resolvedSymbol}`;
        break;
      case "right_space":
        formatted = `${numeric} ${resolvedSymbol}`;
        break;
      case "left":
      default:
        formatted = `${resolvedSymbol}${numeric}`;
        break;
    }

    return isNegative ? `-${formatted}` : formatted;
  };
};

const FALLBACK_FORMATTER = createFormatter(FALLBACK_CURRENCY);

const CurrencyContext = createContext<CurrencyContextValue>({
  ...FALLBACK_CURRENCY,
  format: FALLBACK_FORMATTER,
  formatCurrency: FALLBACK_FORMATTER,
  loading: true,
});

type CurrencyProviderProps = {
  children: ReactNode;
};

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const { data, isLoading, isError, error } = useWooCommerceCurrency();

  const currency = data ?? FALLBACK_CURRENCY;
  const formatter = useMemo(() => createFormatter(currency), [currency]);

  useEffect(() => {
    setCurrencyFormatter(formatter);
    return () => {
      setCurrencyFormatter(FALLBACK_FORMATTER);
    };
  }, [formatter]);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      ...currency,
      format: formatter,
      formatCurrency: formatter,
      loading: isLoading,
      error: isError ? error?.message ?? "Unable to load currency settings." : undefined,
    }),
    [currency, formatter, isLoading, isError, error?.message],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => useContext(CurrencyContext);
