# WordPress Menu Integration Setup

## Problem
The React app needs to fetch menu items from WordPress, but standard REST API doesn't expose menus without plugins.

## Solution
Add a custom REST API endpoint to WordPress.

## Steps

### 1. Add Custom Endpoint to WordPress

Copy the code from `wordpress-menu-endpoint.php` and add it to your WordPress theme's `functions.php` file:

**Location:** `wp-content/themes/YOUR-THEME/functions.php`

Or install the **Code Snippets** plugin and add it there.

### 2. Verify the Endpoint Works

Visit this URL in your browser:
```
https://your-site.com/wp-json/custom/v1/menu/main-menu
```

You should see JSON output with your menu items.

### 3. Frontend Configuration

The React app is already configured to fetch from this endpoint. Once you add the PHP code to WordPress, refresh your React app and the menu will appear!

## Alternative: Use WooCommerce Categories

If you prefer not to modify WordPress, the app can fall back to using WooCommerce categories as navigation. This is already implemented in `HeaderSecondary.tsx` (the fallback when menu returns empty).

## Testing

1. Add the PHP code to WordPress `functions.php`
2. Save
3. Test the endpoint URL
4. Refresh your React app
5. Menu items should appear in the header

## Troubleshooting

- **404 Error**: Permalinks might need to be refreshed. Go to WordPress Admin → Settings → Permalinks → Save Changes
- **Empty Array**: Check that you have a menu assigned to "Main Menu" location in WordPress Admin → Appearance → Menus → Manage Locations
- **CORS Error**: Endpoint should allow CORS by default, but if issues persist, add CORS headers in the PHP function
