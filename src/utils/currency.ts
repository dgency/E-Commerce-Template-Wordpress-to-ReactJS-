type CurrencyFormatter = (amount: number) => string;

const fallbackFormatter: CurrencyFormatter = (amount: number) => {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  try {
    return formatter.format(amount);
  } catch {
    const safe = Number.isFinite(amount) ? amount : 0;
    return `$${safe.toFixed(2)}`;
  }
};

let activeFormatter: CurrencyFormatter = fallbackFormatter;

/**
 * Registers a custom currency formatter used throughout the app.
 */
export function setCurrencyFormatter(fn: CurrencyFormatter) {
  if (typeof fn === "function") {
    activeFormatter = fn;
  } else {
    activeFormatter = fallbackFormatter;
  }
}

/**
 * Formats numeric amounts using the active currency formatter.
 */
export function formatCurrency(amount: number): string {
  try {
    return activeFormatter(amount);
  } catch {
    return fallbackFormatter(amount);
  }
}