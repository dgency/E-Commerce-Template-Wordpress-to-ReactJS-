/* eslint-env deno */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type WooSetting = {
  id?: string;
  value?: unknown;
};

type CurrencyResponse = {
  symbol?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CurrencyPosition = "left" | "right" | "left_space" | "right_space";

type CurrencySettings = {
  currencyCode: string;
  currencySymbol: string;
  currencyPosition: CurrencyPosition;
  thousandSeparator: string;
  decimalSeparator: string;
  decimals: number;
};

const defaultSettings: CurrencySettings = {
  currencyCode: "USD",
  currencySymbol: "$",
  currencyPosition: "left",
  thousandSeparator: ",",
  decimalSeparator: ".",
  decimals: 2,
};

const siteUrl = "https://dgency.net";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const consumerKey = Deno.env.get("WOOCOMMERCE_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("WOOCOMMERCE_CONSUMER_SECRET");

    if (!consumerKey || !consumerSecret) {
      throw new Error("WooCommerce credentials not configured");
    }

    const authParams = `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;

    const settingsResponse = await fetch(
      `${siteUrl}/wp-json/wc/v3/settings/general?context=edit&per_page=100&${authParams}`,
    );

    if (!settingsResponse.ok) {
      throw new Error(`Unable to fetch WooCommerce settings: ${settingsResponse.statusText}`);
    }

    const settings: WooSetting[] = await settingsResponse.json();

    const getSetting = (id: string): string | undefined => {
      const match = settings.find((setting) => setting.id === id);
      if (match?.value == null) {
        return undefined;
      }
      return String(match.value);
    };

    const fetchSettingValue = async (id: string, fallback?: string): Promise<string | undefined> => {
      const fromList = getSetting(id);
      if (fromList !== undefined) {
        return fromList;
      }

      try {
        const singleResponse = await fetch(
          `${siteUrl}/wp-json/wc/v3/settings/general/${id}?context=edit&${authParams}`,
        );

        if (singleResponse.ok) {
          const singleSetting = (await singleResponse.json()) as WooSetting;
          if (singleSetting?.value != null) {
            return String(singleSetting.value);
          }
        } else {
          console.warn(`Settings fallback fetch failed for ${id}: ${singleResponse.status} ${singleResponse.statusText}`);
        }
      } catch (singleError) {
        console.warn(`Settings fallback fetch error for ${id}`, singleError);
      }

      return fallback;
    };

    const currencyCodeRaw = await fetchSettingValue("woocommerce_currency", defaultSettings.currencyCode);
    const currencyCode = (currencyCodeRaw ?? defaultSettings.currencyCode).toUpperCase();

    const rawPosition = await fetchSettingValue("woocommerce_currency_pos", defaultSettings.currencyPosition);
    const normalizedPosition = (rawPosition ?? defaultSettings.currencyPosition).toLowerCase() as CurrencyPosition;
    const allowedPositions: CurrencyPosition[] = ["left", "right", "left_space", "right_space"];
    const currencyPosition = allowedPositions.includes(normalizedPosition)
      ? normalizedPosition
      : defaultSettings.currencyPosition;

    const thousandSeparator = await fetchSettingValue(
      "woocommerce_price_thousand_sep",
      defaultSettings.thousandSeparator,
    ) ?? defaultSettings.thousandSeparator;

    const decimalSeparator = await fetchSettingValue(
      "woocommerce_price_decimal_sep",
      defaultSettings.decimalSeparator,
    ) ?? defaultSettings.decimalSeparator;

    const decimalsSetting = await fetchSettingValue(
      "woocommerce_price_num_decimals",
      String(defaultSettings.decimals),
    );
    const decimalsRaw = Number(decimalsSetting);
    const decimals = Number.isFinite(decimalsRaw) ? Math.max(0, decimalsRaw) : defaultSettings.decimals;

    let currencySymbol = currencyCode;

    try {
      const currencyResponse = await fetch(
  `${siteUrl}/wp-json/wc/v3/data/currencies/${currencyCode.toLowerCase()}?context=edit&${authParams}`,
      );

      if (currencyResponse.ok) {
        const data = (await currencyResponse.json()) as CurrencyResponse;
        if (typeof data?.symbol === "string" && data.symbol.trim().length > 0) {
          currencySymbol = data.symbol.trim();
        }
      } else {
        console.warn(`Currency symbol fetch failed: ${currencyResponse.status} ${currencyResponse.statusText}`);
      }
    } catch (symbolError) {
      console.warn("Currency symbol fetch error", symbolError);
    }

    const payload: CurrencySettings = {
      currencyCode,
      currencySymbol,
      currencyPosition,
      thousandSeparator,
      decimalSeparator,
      decimals,
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in woocommerce-settings function:", error);
    const payload = {
      error: error instanceof Error ? error.message : "Unknown error",
      ...defaultSettings,
    };

    return new Response(JSON.stringify(payload), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
