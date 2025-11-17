import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, preflight, getSiteConfig, json, errorJson } from "../_shared/config.ts";

serve(async (req) => {
  const pf = preflight(req);
  if (pf) return pf;

  try {
  const { consumerKey, consumerSecret, siteUrl } = getSiteConfig();

    if (!consumerKey || !consumerSecret) {
      throw new Error('WooCommerce credentials not configured');
    }

    const orderData = await req.json();

    // Validate line items
    const validatedLineItems = orderData.line_items.map((item: any) => {
      if (!item.product_id || item.product_id === null || isNaN(item.product_id)) {
        throw new Error(`Invalid product_id: ${item.product_id}`);
      }
      return {
        product_id: parseInt(item.product_id, 10),
        quantity: item.quantity || 1,
        subtotal: item.subtotal || item.price,
        total: item.total || item.price,
      };
    });

    const orderPayload: any = {
      payment_method: 'cod',
      payment_method_title: 'Cash on Delivery',
      set_paid: false,
      billing: orderData.billing,
      shipping: orderData.shipping,
      line_items: validatedLineItems,
      customer_id: parseInt(orderData.customer_id, 10) || 0,
    };

    // Optionally include selected shipping zone in order meta for admin visibility
    if (orderData.shipping_zone_id != null) {
      orderPayload.meta_data = [
        { key: 'selected_shipping_zone_id', value: String(orderData.shipping_zone_id) },
      ];
    }

    // Include shipping lines if provided (e.g., flat rate or free shipping)
    if (Array.isArray(orderData.shipping_lines) && orderData.shipping_lines.length > 0) {
      orderPayload.shipping_lines = orderData.shipping_lines.map((s: any) => ({
        method_id: String(s.method_id ?? ''),
        method_title: String(s.method_title ?? 'Shipping'),
        total: String(s.total ?? '0'),
      }));
    }

    console.log('Creating WooCommerce order:', JSON.stringify(orderPayload, null, 2));

    // Create order via WooCommerce REST API
    const response = await fetch(
      `${siteUrl}/wp-json/wc/v3/orders?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('WooCommerce order creation failed:', error);
      throw new Error(error.message || 'Order creation failed');
    }

    const order = await response.json();

    console.log('Order created successfully:', order.id);

    return json({
      orderId: order.id,
      orderNumber: order.number,
      status: order.status,
      total: order.total,
      paymentUrl: order.payment_url || null,
    });
  } catch (error) {
    console.error('Error in woocommerce-checkout function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return errorJson(errorMessage, 500);
  }
});
