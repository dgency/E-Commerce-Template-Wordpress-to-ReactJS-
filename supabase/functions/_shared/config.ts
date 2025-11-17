/* eslint-env deno */
// Centralized config for all Edge Functions
// Prefer environment variables in production. For quick local overrides, you may
// edit this file, but avoid committing secrets.

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export function preflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}

function getRequiredEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v || !v.trim()) {
    throw new Error(`Missing required env: ${name}`);
  }
  return v;
}

export function getSiteConfig() {
  // Primary: use environment variables set via Supabase secrets
  const siteUrl = getRequiredEnv('WORDPRESS_SITE_URL');
  const consumerKey = getRequiredEnv('WOOCOMMERCE_CONSUMER_KEY');
  const consumerSecret = getRequiredEnv('WOOCOMMERCE_CONSUMER_SECRET');
  return { siteUrl, consumerKey, consumerSecret };
}

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...corsHeaders, ...(init?.headers as Record<string, string> | undefined) },
  });
}

export function errorJson(message: string, status = 500) {
  return json({ error: message }, { status });
}

export function normalizeImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.protocol === 'http:') {
      u.protocol = 'https:';
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}
