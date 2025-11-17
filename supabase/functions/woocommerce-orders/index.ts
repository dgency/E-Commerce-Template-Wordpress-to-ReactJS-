import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, preflight, getSiteConfig, json, errorJson, normalizeImageUrl } from "../_shared/config.ts";

serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
  const { consumerKey, consumerSecret, siteUrl } = getSiteConfig();

    if (!consumerKey || !consumerSecret) {
      throw new Error('WooCommerce credentials not configured');
    }

    const url = new URL(req.url);
  const customerId = url.searchParams.get('customer_id');
  const orderId = url.searchParams.get('order_id');
  const phone = url.searchParams.get('phone');

    let apiUrl: string;

    if (orderId) {
      // Get specific order
      apiUrl = `${siteUrl}/wp-json/wc/v3/orders/${orderId}?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`;
    } else if (customerId) {
      // Get orders for specific customer
      apiUrl = `${siteUrl}/wp-json/wc/v3/orders?customer=${customerId}&consumer_key=${consumerKey}&consumer_secret=${consumerSecret}&per_page=100&orderby=date&order=desc`;
    } else if (phone) {
      // Lookup by billing phone: fetch recent orders and filter on server side
      const listUrl = `${siteUrl}/wp-json/wc/v3/orders?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}&per_page=100&orderby=date&order=desc`;
      console.log('Fetching orders for phone filter from WooCommerce:', listUrl);
      const listResp = await fetch(listUrl);
      if (!listResp.ok) {
        throw new Error(`WooCommerce API error: ${listResp.statusText}`);
      }
      const orderList = await listResp.json();
      const normalize = (p: string) => (p || '').replace(/[^0-9]/g, '');
      const inputDigits = normalize(phone);
      // Choose last up to 10 digits of input for matching to handle country codes
      const short = inputDigits.slice(-10) || inputDigits;
      const matched = (orderList as any[]).filter((o) => {
        const digits = normalize(o?.billing?.phone ?? '');
        return digits.endsWith(short) && digits.length > 0;
      });
      if (!matched.length) {
        return json({ error: 'No orders found for provided phone' }, { status: 404 });
      }
      const latest = matched[0];
      const transformOrder = (order: any) => ({
        id: order.id.toString(),
        orderNumber: order.number,
        date: order.date_created,
        status: order.status,
        total: parseFloat(order.total),
        currency: order.currency,
        items: order.line_items?.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          total: parseFloat(item.total),
          image: normalizeImageUrl(item.image?.src) || '',
        })) || [],
        billing: order.billing,
        shipping: order.shipping,
        paymentMethod: order.payment_method_title,
      });
      const payload = transformOrder(latest);
      console.log('Found order by phone:', payload?.id);
      return json(payload);
    } else {
      throw new Error('customer_id or order_id parameter required');
    }

    console.log('Fetching orders from WooCommerce:', apiUrl);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`WooCommerce API error: ${response.statusText}`);
    }

  const orders = await response.json();

    // Transform orders to match our app's format
    const transformOrder = (order: any) => ({
      id: order.id.toString(),
      orderNumber: order.number,
      date: order.date_created,
      status: order.status,
      total: parseFloat(order.total),
      currency: order.currency,
      items: order.line_items?.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.total),
        image: normalizeImageUrl(item.image?.src) || '',
      })) || [],
      billing: order.billing,
      shipping: order.shipping,
      paymentMethod: order.payment_method_title,
    });

    const transformedOrders = Array.isArray(orders) 
      ? orders.map(transformOrder)
      : transformOrder(orders);

    console.log(`Successfully fetched ${Array.isArray(transformedOrders) ? transformedOrders.length : 1} orders`);

    return json(transformedOrders);
  } catch (error) {
    console.error('Error in woocommerce-orders function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorJson(errorMessage, 500);
  }
});
