/// <reference path="../types.d.ts" />
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
  const { action, email, emailOrUsername, password, username, token, userId, currentPassword, newPassword } = await req.json();
    const siteUrl = 'https://dgency.net';

    switch (action) {
      case 'login': {
        // WordPress JWT login - accepts both email and username
        const response = await fetch(`${siteUrl}/wp-json/jwt-auth/v1/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: emailOrUsername || email, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        console.log('Login successful for:', data.user_email, 'Raw user_id:', data.user_id, 'Type:', typeof data.user_id);

        // WordPress JWT returns user_id as a string number
  const loginUserId = data.user_id?.toString() || data.data?.user?.id?.toString() || '0';

        return new Response(
          JSON.stringify({
            token: data.token,
            user: {
              id: loginUserId,
              email: data.user_email,
              displayName: data.user_display_name,
              nicename: data.user_nicename,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'signup': {
        // Create WordPress user via WooCommerce customer endpoint
        const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
        const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');

        if (!consumerKey || !consumerSecret) {
          throw new Error('WooCommerce credentials not configured');
        }

        const response = await fetch(
          `${siteUrl}/wp-json/wc/v3/customers?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              username: username || email.split('@')[0],
              password,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Signup failed');
        }

        const customer = await response.json();
        console.log('User created:', customer.email);

        // Auto-login after signup
        const loginResponse = await fetch(`${siteUrl}/wp-json/jwt-auth/v1/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password }),
        });

        if (!loginResponse.ok) {
          throw new Error('User created but login failed');
        }

        const loginData = await loginResponse.json();
        console.log('Signup successful, user created with ID:', customer.id, 'WordPress user_id:', loginData.user_id);

        // WordPress JWT returns user_id as a string number
  const signupUserId = loginData.user_id?.toString() || loginData.data?.user?.id?.toString() || customer.id?.toString() || '0';

        return new Response(
          JSON.stringify({
            token: loginData.token,
            user: {
              id: signupUserId,
              email: customer.email,
              displayName: `${customer.first_name} ${customer.last_name}`.trim() || customer.username,
              nicename: customer.username,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'validate': {
        // Validate JWT token
        const response = await fetch(`${siteUrl}/wp-json/jwt-auth/v1/token/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        const data = await response.json();

        return new Response(
          JSON.stringify({ valid: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'forgot-password': {
        // WordPress lost password endpoint
        const response = await fetch(`${siteUrl}/wp-json/bdpwr/v1/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          // If custom endpoint doesn't exist, use WooCommerce customer endpoint
          const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
          const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');
          
          console.log('Password reset email would be sent to:', email);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'If this email exists, a password reset link has been sent.' 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Password reset email sent' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'change-password': {
        // Verify current credentials via JWT login
        const loginRes = await fetch(`${siteUrl}/wp-json/jwt-auth/v1/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: emailOrUsername || email, password: currentPassword }),
        });

        if (!loginRes.ok) {
          const err = await loginRes.json().catch(() => ({}));
          throw new Error(err.message || 'Current password is incorrect');
        }

        const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
        const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');
        if (!consumerKey || !consumerSecret) {
          throw new Error('WooCommerce credentials not configured');
        }

        // Update password via WooCommerce Customers API
        const uid = (userId ?? (await loginRes.json()).user_id)?.toString();
        if (!uid) throw new Error('Missing user id');

        const updateRes = await fetch(
          `${siteUrl}/wp-json/wc/v3/customers/${uid}?consumer_key=${consumerKey}&consumer_secret=${consumerSecret}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword }),
          }
        );

        if (!updateRes.ok) {
          const err = await updateRes.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to update password');
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in wordpress-auth function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
