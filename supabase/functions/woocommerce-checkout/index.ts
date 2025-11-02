import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const siteUrl = 'https://dgency.net';

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

    const orderPayload = {
      payment_method: 'cod',
      payment_method_title: 'Cash on Delivery',
      set_paid: false,
      billing: orderData.billing,
      shipping: orderData.shipping,
      line_items: validatedLineItems,
      customer_id: parseInt(orderData.customer_id, 10) || 0,
    };

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

    return new Response(
      JSON.stringify({
        orderId: order.id,
        orderNumber: order.number,
        status: order.status,
        total: order.total,
        paymentUrl: order.payment_url || null,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in woocommerce-checkout function:', error);
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
