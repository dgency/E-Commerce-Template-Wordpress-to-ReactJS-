/* eslint-env deno */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type WooCategory = {
  id: number | string;
  name?: string;
  slug?: string;
  image?: { src?: string } | null;
  description?: string;
  count?: number;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
  const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');
  const siteUrl = Deno.env.get('WORDPRESS_SITE_URL') ?? 'https://dgency.net';

    if (!consumerKey || !consumerSecret) {
      throw new Error('WooCommerce credentials not configured');
    }

    const url = new URL(req.url);
    const search = url.searchParams.get('search');
    const perPage = url.searchParams.get('per_page') || '100';

    let apiUrl = `${siteUrl}/wp-json/wc/v3/products/categories?per_page=${perPage}&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }

    console.log('Fetching categories from WooCommerce:', apiUrl);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.statusText}`);
    }

    const categories: WooCategory[] = await response.json();

    // Transform WooCommerce categories to match our app's format
    const transformedCategories = categories
      .filter((cat) => (cat.count ?? 0) > 0) // Only categories with products
      .map((category) => ({
        id: category.id.toString(),
        name: category.name ?? '',
        slug: category.slug ?? '',
        image: (category.image?.src) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        description: category.description?.replace(/<[^>]*>/g, '') || '',
        count: category.count ?? 0,
      }));

    console.log(`Successfully fetched ${transformedCategories.length} categories`);

    return new Response(
      JSON.stringify(transformedCategories),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in woocommerce-categories function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
