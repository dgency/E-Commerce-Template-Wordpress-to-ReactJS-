import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useWooCommerceCurrency, type WooCommerceCurrencySettings } from "@/hooks/useWooCommerceCurrency";

type CurrencyContextValue = {
  settings: WooCommerceCurrencySettings;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
  error?: string;
};

const defaultSettings: WooCommerceCurrencySettings = {
  currencyCode: "USD",
  currencySymbol: "$",
  currencyPosition: "left",
  thousandSeparator: ",",
  decimalSeparator: ".",
  decimals: 2,
};

type FormatSettings = Pick<
  WooCommerceCurrencySettings,
  "currencySymbol" | "currencyPosition" | "thousandSeparator" | "decimalSeparator" | "decimals"
> & { currencyCode: string };

const formatAmount = (amount: number, settings: FormatSettings): string => {
  const {
    currencySymbol,
    currencyPosition,
    thousandSeparator,
    decimalSeparator,
    decimals,
    currencyCode,
  } = settings;

  const precision = Number.isFinite(decimals) ? Math.max(0, decimals) : 2;
  const absoluteAmount = Math.abs(amount);
  const fixed = absoluteAmount.toFixed(precision);
  const [rawIntegers, rawDecimals = ""] = fixed.split(".");

  const integerWithSeparator = rawIntegers.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);

  const numberPortion = precision > 0
    ? `${integerWithSeparator}${decimalSeparator}${rawDecimals}`
    : integerWithSeparator;

  const symbol = currencySymbol || currencyCode;

  let formatted = "";
  switch (currencyPosition) {
    case "right":
      formatted = `${numberPortion}${symbol}`;
      break;
    case "left_space":
      formatted = `${symbol} ${numberPortion}`;
      break;
    case "right_space":
      formatted = `${numberPortion} ${symbol}`;
      break;
    case "left":
    default:
      formatted = `${symbol}${numberPortion}`;
      break;
  }

  if (amount < 0) {
    return `-${formatted}`;
  }

  return formatted;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  settings: defaultSettings,
  formatCurrency: (amount: number) => formatAmount(amount, defaultSettings),
  isLoading: false,
});

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const { data, isLoading, isError, error } = useWooCommerceCurrency();

  const settings = data ?? defaultSettings;

  const formatCurrency = useMemo(() => {
    return (amount: number) => formatAmount(amount, settings);
  }, [settings]);

  const value = useMemo<CurrencyContextValue>(() => ({
    settings,
    formatCurrency,
    isLoading,
    error: isError ? error?.message ?? "Unable to load currency settings" : undefined,
  }), [settings, formatCurrency, isLoading, isError, error?.message]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => useContext(CurrencyContext);
