/* eslint-env deno */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, preflight, getSiteConfig, json } from "../_shared/config.ts";

type WooMethodSetting = { id?: string; value?: unknown };
type WooMethod = {
  id?: number; // instance id
  method_id?: string; // e.g. 'flat_rate', 'free_shipping'
  title?: string;
  enabled?: boolean | string;
  settings?: Record<string, WooMethodSetting | string | number | null>;
};

type SimpleMethod = {
  instance_id: number;
  method_id: string;
  title: string;
  cost: number; // 0 for free shipping
};

serve(async (req: Request) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const { siteUrl, consumerKey, consumerSecret } = getSiteConfig();
    if (!consumerKey || !consumerSecret) {
      throw new Error("WooCommerce credentials not configured");
    }

    const url = new URL(req.url);
    const zoneId = url.searchParams.get("zone_id");
    if (!zoneId) {
      return json({ error: "zone_id is required" }, { status: 400 });
    }

    const authParams = `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
    const res = await fetch(
      `${siteUrl}/wp-json/wc/v3/shipping/zones/${zoneId}/methods?per_page=100&${authParams}`,
    );
    if (!res.ok) {
      throw new Error(`Unable to fetch shipping methods: ${res.status} ${res.statusText}`);
    }
    const methods = (await res.json()) as WooMethod[];

    const enabled = methods.filter((m) => {
      const flag = typeof m.enabled === "string" ? m.enabled === "yes" : Boolean(m.enabled);
      return flag && (m.method_id === "flat_rate" || m.method_id === "free_shipping");
    });

    const simplified: SimpleMethod[] = enabled.map((m) => {
      let cost = 0;
      if (m.method_id === "flat_rate") {
        // settings.cost may be nested or direct
        const settings = m.settings ?? {};
        const s = settings as Record<string, unknown>;
        const raw = (s.cost as WooMethodSetting)?.value ?? (s.cost as string | number | null) ?? "0";
        const parsed = parseFloat(String(raw));
        cost = Number.isFinite(parsed) ? parsed : 0;
      }
      return {
        instance_id: Number(m.id ?? 0),
        method_id: String(m.method_id ?? ""),
        title: String(m.title ?? (m.method_id === "free_shipping" ? "Free shipping" : "Shipping")),
        cost,
      };
    });

    return json(simplified);
  } catch (error) {
    console.error("Error in woocommerce-shipping-methods function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: message }, { status: 500 });
  }
});
