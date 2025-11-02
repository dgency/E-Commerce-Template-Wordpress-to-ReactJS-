/* eslint-env deno */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Minimal WooCommerce types used for transformation
type WooImage = { src?: string };
type WooAttribute = { name?: string; slug?: string; options?: Array<string | { name?: string; title?: string }> };
type WooMeta = { key?: string; value?: unknown };
type WooCategory = { id?: number; slug?: string };
type WooProduct = {
  id: number | string;
  name?: string;
  slug?: string;
  categories?: WooCategory[];
  price?: string | number;
  regular_price?: string | number;
  sale_price?: string | number;
  images?: WooImage[];
  average_rating?: string | number;
  stock_status?: string;
  short_description?: string;
  description?: string;
  attributes?: WooAttribute[];
  meta_data?: WooMeta[];
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');
    const siteUrl = 'https://dgency.net';

    if (!consumerKey || !consumerSecret) {
      throw new Error('WooCommerce credentials not configured');
    }

    // Get query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
  const slug = url.searchParams.get('slug');
  const search = url.searchParams.get('search');
    const perPage = url.searchParams.get('per_page') || '100';

    // Build WooCommerce API URL
  let apiUrl = `${siteUrl}/wp-json/wc/v3/products?per_page=${perPage}&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
    
    if (category) {
      // First, fetch the category ID
      const categoryResponse = await fetch(
        `${siteUrl}/wp-json/wc/v3/products/categories?slug=${category}&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`
      );
      const categories = await categoryResponse.json();
      
      if (categories.length > 0) {
        apiUrl += `&category=${categories[0].id}`;
      }
    }

    if (slug) {
      apiUrl += `&slug=${slug}`;
    }
    if (search) {
      apiUrl += `&search=${encodeURIComponent(search)}`;
    }

    console.log('Fetching products from WooCommerce:', apiUrl);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.statusText}`);
    }

  const products: WooProduct[] = await response.json();

    // Transform WooCommerce products to match our app's format
  const transformedProducts = products.map((product: WooProduct) => {
      // Try to extract a brand from common Woo data locations
      let brand: string | undefined = undefined;

      try {
        // 1) Attributes (most common). Woo returns [{ name, slug?, options: [..] }]
  const attrs: WooAttribute[] = Array.isArray(product.attributes) ? product.attributes : [];
        const brandAttr = attrs.find((a) => {
          const name = (a?.name ?? '').toString().toLowerCase();
          const slug = (a?.slug ?? '').toString().toLowerCase();
          return name === 'brand' || /(^|[_-])(brand|productbrand|yith_brand)(-|$)/.test(slug);
        });
        const attrOption = brandAttr && Array.isArray(brandAttr.options) && brandAttr.options.length > 0
          ? brandAttr.options[0]
          : undefined;

        if (attrOption && typeof attrOption === 'string') {
          brand = attrOption;
        }

        // 2) Meta data fallbacks (plugins sometimes store keys like _brand or product_brand)
        if (!brand && Array.isArray(product.meta_data)) {
          const meta = product.meta_data as WooMeta[];
          const brandMeta = meta.find((m) => {
            const key = (m?.key ?? '').toString().toLowerCase();
            return key === 'brand' || key === '_brand' || key === 'product_brand' || key === 'yith_product_brand';
          });
          const metaVal = brandMeta?.value;

          if (typeof metaVal === 'string' && metaVal.trim()) {
            brand = metaVal.trim();
          }
          // Some plugins store brand as an object or array with name property
          if (!brand && metaVal && typeof metaVal === 'object') {
            if (Array.isArray(metaVal) && metaVal.length > 0) {
              const first = metaVal[0] as { name?: string; title?: string };
              const nm = (first?.name ?? first?.title ?? '').toString();
              brand = nm || undefined;
            } else {
              const obj = metaVal as { name?: string; title?: string };
              const nm = (obj?.name ?? obj?.title ?? '').toString();
              brand = nm || undefined;
            }
          }
        }
      } catch (_) {
        // Ignore brand extraction errors; brand will be undefined
      }

      // Prepare simplified attributes for client fallback/debug
      const attributes = Array.isArray(product.attributes)
        ? product.attributes.map((a) => ({
            name: a?.name ?? undefined,
            options: Array.isArray(a?.options)
              ? a.options.map((o) => (typeof o === 'string' ? o : (o?.name ?? o?.title ?? '') as string)).filter(Boolean)
              : [],
          }))
        : [];

      return {
        id: product.id.toString(),
        name: product.name,
        slug: product.slug,
        category: product.categories?.[0]?.slug || 'uncategorized',
        price: parseFloat(String(product.price ?? '0')) || 0,
        originalPrice: product.regular_price != null
          ? parseFloat(String(product.regular_price))
          : parseFloat(String(product.price ?? '0')),
        discount: product.sale_price
          ? Math.round(((parseFloat(String(product.regular_price ?? '0')) - parseFloat(String(product.sale_price))) / parseFloat(String(product.regular_price ?? '0'))) * 100)
          : 0,
        image: product.images?.[0]?.src || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
  rating: parseFloat(String(product.average_rating ?? '0')) || 0,
        inStock: product.stock_status === 'instock',
        description: product.short_description?.replace(/<[^>]*>/g, '') || product.description?.replace(/<[^>]*>/g, '') || '',
        fullDescription: product.description || '',
        images: product.images?.map((img: WooImage) => img.src ?? '').filter(Boolean) || [],
        // new optional field
        brand,
        // expose simplified attributes for client-side fallback
        attributes,
      };
    });

    console.log(`Successfully fetched ${transformedProducts.length} products`);

    return new Response(
      JSON.stringify(transformedProducts),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in woocommerce-products function:', error);
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
