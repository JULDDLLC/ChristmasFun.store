// supabase/functions/christmas-multi-checkout/index.ts

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

// ---------- Supabase + Stripe setup ----------

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' })
  : null;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  // include the headers your frontend actually sends
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, apikey, X-Client-Info',
};

// ---------- Types ----------

interface CartItem {
  type: string; // e.g. "santa_letter", "christmas_note", "bundle_complete", etc.
  designNumber?: number | null;
  noteNumber?: number | null;
  name: string;
  price: number; // price in dollars (0.99, 2.99, 9.99, etc.)
}

interface MultiCheckoutRequest {
  items: CartItem[];
  customerEmail: string;
}

// ---------- Helper to create JSON responses with CORS ----------

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// ---------- Main handler ----------

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!stripe || !stripeSecret) {
    console.error('Stripe is not configured correctly in environment variables.');
    return jsonResponse(
      { error: 'Payment system not configured. Please contact support.' },
      500,
    );
  }

  try {
    const body = (await req.json()) as MultiCheckoutRequest;
    const { items, customerEmail } = body;

    // ---- Basic validation ----
    if (!customerEmail || typeof customerEmail !== 'string') {
      return jsonResponse(
        { error: 'Missing or invalid customerEmail' },
        400,
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return jsonResponse(
        { error: 'Cart is empty. Please add items before checkout.' },
        400,
      );
    }

    // Validate items and build Stripe line_items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let totalAmountCents = 0;

    for (const item of items) {
      if (!item || typeof item.price !== 'number' || !item.name) {
        return jsonResponse(
          { error: 'Invalid item in cart. Please refresh and try again.' },
          400,
        );
      }

      // Convert dollars to cents safely
      const amountCents = Math.round(item.price * 100);

      if (amountCents < 0) {
        return jsonResponse(
          { error: 'Invalid item price in cart' },
          400,
        );
      }

      totalAmountCents += amountCents;

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            // optional: you could include more descriptive info here later
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      });
    }

    // If somehow total is zero, bail
    if (totalAmountCents <= 0) {
      return jsonResponse(
        { error: 'Cart total is zero. Please check your items.' },
        400,
      );
    }

    // ---- Create order record in Supabase ----
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        product_type: items.length === 1 ? items[0].type ?? 'cart' : 'cart',
        product_id: 'cart',
        amount: totalAmountCents,
        status: 'pending',
        download_links: [],
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Failed to create order:', orderError);
      return jsonResponse(
        { error: 'Failed to create order' },
        500,
      );
    }

    // ---- Determine origin for redirect URLs ----
    const url = new URL(req.url);
    const originHeader = req.headers.get('origin');
    const origin = originHeader ?? `${url.protocol}//${url.host}`;

    // ---- Create Stripe Checkout Session ----
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      customer_email: customerEmail,
      line_items: lineItems,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      metadata: {
        order_id: order.id.toString(),
        product_type: items.length === 1 ? items[0].type ?? 'cart' : 'cart',
        product_id: 'cart',
        // You can add more metadata later (e.g. cart JSON) if needed
      },
    });

    // ---- Update order with Stripe session info ----
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        stripe_session_id: session.id,
        checkout_url: session.url,
        status: 'checkout_created',
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Non-fatal: failed to update order after Stripe:', updateError);
      // We still return success to the client, because the Stripe session exists.
    }

    // ---- Return session URL to frontend ----
    return jsonResponse(
      { sessionId: session.id, url: session.url },
      200,
    );
  } catch (err: any) {
    console.error('Multi-checkout error:', err);
    return jsonResponse(
      {
        error: `Payment error: ${err?.message ?? 'Unknown error'}`,
      },
      500,
    );
  }
});
