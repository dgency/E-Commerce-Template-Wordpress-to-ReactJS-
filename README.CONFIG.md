# One-place configuration for new WordPress stores

Use this checklist when switching the template to a different WordPress + WooCommerce site.

1) Branding source
- Branding comes from your WordPress site (logo + favicon). If WP doesn't provide a logo, the site name text is shown. There is no local favicon fallback.

2) Frontend environment (.env)
- Copy `.env.example` to `.env`
- Set:
  - `VITE_WP_API_URL` = https://your-wordpress-site.com
  - `VITE_SUPABASE_URL` = https://<project>.supabase.co
  - `VITE_SUPABASE_ANON_KEY` = <anon key from Supabase>
- Restart dev server after changes.

3) Supabase function secrets (WooCommerce credentials)
- In Supabase Dashboard → Project Settings → Functions → Secrets, set:
  - `WORDPRESS_SITE_URL` = https://your-wordpress-site.com
  - `WOOCOMMERCE_CONSUMER_KEY` = ck_...
  - `WOOCOMMERCE_CONSUMER_SECRET` = cs_...
- Redeploy/restart functions.

4) Where these values are used
- Frontend reads `VITE_WP_API_URL` for general site info and brand assets.
- All Edge Functions read `WORDPRESS_SITE_URL` and Woo keys for API calls.
- Header logo uses the WP brand logo; if absent, it renders the site name text.
- Favicon is set dynamically from WP; `index.html` contains no static favicon tags.

5) Test
- Home loads categories/products (via functions)
- Account → Track Order works with your Woo data
- Branding shows your WP logo (or site name) and favicon

If you prefer local-only branding, we can add a toggle to bypass WP brand hooks and use static assets instead.
