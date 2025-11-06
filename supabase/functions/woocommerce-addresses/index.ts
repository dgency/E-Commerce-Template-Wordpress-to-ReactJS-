/* eslint-env deno */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const siteUrl = Deno.env.get("WORDPRESS_SITE_URL") ?? "https://dgency.net";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const consumerKey = Deno.env.get("WOOCOMMERCE_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("WOOCOMMERCE_CONSUMER_SECRET");

    if (!consumerKey || !consumerSecret) {
      return new Response(JSON.stringify({ error: "WooCommerce credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const customerId = url.searchParams.get("customer_id");
    const authParams = `consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;

    if (req.method === "GET") {
      if (!customerId) {
        return new Response(JSON.stringify({ error: "customer_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const resp = await fetch(`${siteUrl}/wp-json/wc/v3/customers/${customerId}?${authParams}`);
      if (!resp.ok) {
        const text = await resp.text();
        return new Response(JSON.stringify({ error: `Woo fetch failed: ${resp.status} ${text}` }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const customer = await resp.json();
      return new Response(JSON.stringify({ billing: customer.billing, shipping: customer.shipping }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT" || req.method === "POST") {
      const body = await req.json();
      const id = String(body.customer_id ?? customerId ?? "").trim();
      if (!id) {
        return new Response(JSON.stringify({ error: "customer_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payload: Record<string, unknown> = {};
      if (body.billing) payload.billing = body.billing;
      if (body.shipping) payload.shipping = body.shipping;
      if (Object.keys(payload).length === 0) {
        return new Response(JSON.stringify({ error: "billing or shipping required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const resp = await fetch(`${siteUrl}/wp-json/wc/v3/customers/${id}?${authParams}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        return new Response(JSON.stringify({ error: `Woo update failed: ${resp.status} ${text}` }), {
          status: resp.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updated = await resp.json();
      return new Response(JSON.stringify({ billing: updated.billing, shipping: updated.shipping }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
