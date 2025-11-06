# Supabase Edge Functions configuration

Set your WooCommerce and WordPress credentials as Function Secrets in your Supabase project.

Required secrets (Dashboard → Project Settings → Functions → Secrets):

- WORDPRESS_SITE_URL: https://your-wordpress-site.com (no trailing slash)
- WOOCOMMERCE_CONSUMER_KEY: ck_XXXXXXXXXXXXXXXXXXXXXXXXXXXX
- WOOCOMMERCE_CONSUMER_SECRET: cs_XXXXXXXXXXXXXXXXXXXXXXXXXXXX

Optional secrets:
- JWT_SECRET or other auth-related keys if you use wordpress-auth function.

Deploy/reload notes:
- After adding or changing secrets, redeploy or restart functions.
- Each function reads `WORDPRESS_SITE_URL` instead of a hardcoded domain.

Used by functions:
- woocommerce-products
- woocommerce-categories
- woocommerce-orders
- woocommerce-checkout
- woocommerce-addresses
- woocommerce-settings
- wordpress-site-assets

