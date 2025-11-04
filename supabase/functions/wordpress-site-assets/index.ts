/* eslint-env deno */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Prefer env override, fallback to the same hardcoded pattern used elsewhere
const siteUrl = Deno.env.get("WORDPRESS_SITE_URL") ?? "https://dgency.net";

async function findMediaUrl(terms: string[]): Promise<string | null> {
  for (const term of terms) {
    try {
      const res = await fetch(
        `${siteUrl}/wp-json/wp/v2/media?search=${encodeURIComponent(term)}&per_page=5&_fields=source_url,media_type,alt_text`,
      );
      if (!res.ok) continue;
      const items = (await res.json()) as Array<{ source_url?: string; media_type?: string; alt_text?: string }>;
      const match = items.find((m) => m.media_type === "image" && typeof m.source_url === "string" && m.source_url.length > 0);
      if (match?.source_url) return match.source_url;
    } catch (_) {
      // ignore and try next term
    }
  }
  return null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    // Always respond to preflight with CORS headers
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const logoUrl = await findMediaUrl(["site-logo", "logo", "brand", "header logo"]);
    const faviconFromMedia = await findMediaUrl(["site-icon", "favicon", "icon-32", "icon-64"]);
    const faviconUrl = faviconFromMedia ?? `${siteUrl.replace(/\/$/, "")}/favicon.ico`;

    const payload = { logoUrl, faviconUrl, siteUrl };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Always return CORS headers on error
    console.error("wordpress-site-assets error", error);
    return new Response(JSON.stringify({ logoUrl: null, faviconUrl: `${siteUrl}/favicon.ico`, error: true }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
