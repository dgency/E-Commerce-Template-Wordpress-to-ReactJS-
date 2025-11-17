/* eslint-env deno */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, preflight, getSiteConfig, json, errorJson } from "../_shared/config.ts";

interface MenuItem {
  id: number;
  title: string;
  url: string;
  slug: string;
  parent?: number;
  children?: MenuItem[];
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { siteUrl } = getSiteConfig();
    
    // Get menu location from query params (default to "main-menu")
    const url = new URL(req.url);
    const menuLocation = url.searchParams.get("location") || "main-menu";

    console.log(`Fetching menu from: ${siteUrl}`);

    // Try to fetch menu via custom REST endpoint (requires WP plugin support)
    // Fallback to fetching pages/categories as menu items
    let menuItems: MenuItem[] = [];

    try {
      // First try: WordPress REST API for menus (if REST API plugin is installed)
      const menusResponse = await fetch(`${siteUrl}/wp-json/wp-api-menus/v2/menus`);
      
      if (menusResponse.ok) {
        const menus = await menusResponse.json();
        const mainMenu = menus.find((m: any) => 
          m.slug === menuLocation || m.name?.toLowerCase().includes("main")
        );

        if (mainMenu?.items) {
          menuItems = mainMenu.items.map((item: any) => ({
            id: item.ID || item.id,
            title: item.title || item.post_title,
            url: item.url,
            slug: item.slug || item.post_name || "",
            parent: item.menu_item_parent || 0,
          }));
        }
      }
    } catch (error) {
      console.log("WP REST Menus API not available, trying alternative...");
    }

    // Fallback: If no menu items found, fetch WooCommerce categories as menu
    if (menuItems.length === 0) {
      console.log("Falling back to WooCommerce categories as menu items");
      
      const { consumerKey, consumerSecret } = getSiteConfig();
      const categoriesResponse = await fetch(
        `${siteUrl}/wp-json/wc/v3/products/categories?per_page=10&parent=0&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`
      );

      if (categoriesResponse.ok) {
        const categories = await categoriesResponse.json();
        menuItems = [
          {
            id: 0,
            title: "All Products",
            url: "/shop",
            slug: "shop",
            parent: 0,
          },
          ...categories.map((cat: any, index: number) => ({
            id: index + 1,
            title: cat.name,
            url: `/category/${cat.slug}`,
            slug: cat.slug,
            parent: 0,
          }))
        ];
      }
    }

    console.log(`Returning ${menuItems.length} menu items`);
    return json(menuItems);
  } catch (error) {
    console.error("wordpress-menus error:", error);
    // Return empty array on error instead of failing
    return json([]);
  }
});
