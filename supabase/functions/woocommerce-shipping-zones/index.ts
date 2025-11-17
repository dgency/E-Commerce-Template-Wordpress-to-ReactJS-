/* eslint-env deno */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, preflight, getSiteConfig, json } from "../_shared/config.ts";

type Zone = { id: number; name: string };

serve(async (req: Request) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
    const { siteUrl, consumerKey, consumerSecret } = getSiteConfig();

    if (!consumerKey || !consumerSecret) {
      throw new Error("WooCommerce credentials not configured");
    }

    const authParams = `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;

    const zonesRes = await fetch(`${siteUrl}/wp-json/wc/v3/shipping/zones?${authParams}`);
    if (!zonesRes.ok) {
      throw new Error(`Unable to fetch shipping zones: ${zonesRes.status} ${zonesRes.statusText}`);
    }
    const zones = (await zonesRes.json()) as Zone[];

    // Minimal payload for UI radio list
    const payload = zones.map((z) => ({ id: z.id, name: z.name }));

    return json(payload);
  } catch (error) {
    console.error("Error in woocommerce-shipping-zones function:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: message }, { status: 500 });
  }
});
