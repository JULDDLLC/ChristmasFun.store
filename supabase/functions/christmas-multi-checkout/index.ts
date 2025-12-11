// supabase/functions/christmas-multi-checkout/index.ts

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' })
  : null;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CartItem {
  type: string; // e.g. 'santa_letter', 'christmas_note', etc.
  name: string;
  price: number; // in dollars, e.g. 0.99, 2.99, 9.99
  designNumber?: number | null;
  noteNumber?: number | null;
}

interface CheckoutRequest {
  items: CartItem[];
  customerEmail: string;
}

Deno.serve(async (req: Request) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!stripe || !stripeSecret) {
      console.error('Stripe configuration missing');
      return new Response(
        JSON.stringify({ error: 'Stripe configuration missing' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: CheckoutRequest = await req.json();
    const { items, customerEmail } = body ?? {};

    if (!customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Missing customerEmail or items in request body',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Basic validation + compute total in cents
    let totalAmountCents = 0;

    const lineItems = items.map((item, index) => {
      if (typeof item.price !== 'number' || item.price < 0) {
        throw new Error(`Invalid price for item at index ${index}`);
      }

      const unitAmount = Math.round(item.price * 100);
      totalAmountCents += unitAmount;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name || `Item ${index + 1}`,
            // Optional: description could include type/design numbers
          },
          unit_amount: unitAmount,
        },
        quantity: 1,
      };
    });

    // Create a single "cart" order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        product_type: 'cart',   // generic type for multi-item checkout
        product_id: 'cart',     // generic id
        amount: totalAmountCents,
        status: 'pending',
        download_links: [],
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error (multi-checkout):', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(req.url);
    const origin = req.headers.get('origin') ?? `${url.protocol}//${url.host}`;

    // Create Stripe Checkout Session with multiple line items
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      mode: 'payment',
      line_items: lineItems,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      customer_email: customerEmail,
      metadata: {
        order_id: order.id.toString(),
        product_type: 'cart',
        product_id: 'cart',
      },
    });

    // Update order with Stripe info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        stripe_session_id: session.id,
        checkout_url: session.url,
        status: 'checkout_created',
      })
      .eq('id', order.id);

    if (updateError) {
      console.error(
        'Non-fatal: failed to update order with Stripe session (multi-checkout):',
        updateError
      );
      // don’t fail the checkout if this update breaks
    }

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Multi-checkout error:', err);
    return new Response(
      JSON.stringify({
        error: err?.message ?? 'Unknown multi-checkout error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
