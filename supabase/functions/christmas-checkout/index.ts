// supabase/functions/christmas-checkout/index.ts

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');

const stripe = stripeSecret
  ? new Stripe(stripeSecret, { apiVersion: '2023-10-16' })
  : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey',
};

type ProductId =
  | 'single_letter_99'
  | 'bundle_14_999'
  | 'notes_bundle_299'
  | 'complete_bundle_999'
  | 'teacher_license_499';

interface CheckoutRequest {
  productId: ProductId;
  customerEmail: string;
  designNumber?: number;
}

type ProductConfig = {
  name: string;
  description: string;
  amount: number; // in cents, for storing in orders table
  stripePriceId: string;
  productType: string;
};

// IMPORTANT: these use your real Stripe Price IDs
const PRODUCT_CONFIG: Record<ProductId, ProductConfig> = {
  single_letter_99: {
    name: 'Santa Letter (Single) - $0.99',
    description: 'One premium Santa letter design',
    amount: 99,
    stripePriceId: 'price_1ScHCUBsr66TjEhQI5HBQqtU',
    productType: 'single_letter',
  },
  bundle_14_999: {
    // If this product id is used anywhere it will share the full bundle price
    name: 'All 18 Designs Bundle - $9.99',
    description: 'All 14 Santa letters + 4 Christmas notes',
    amount: 999,
    stripePriceId: 'price_1ScGjvBsr66TjEhQ4cRtPYm1',
    productType: 'letters_bundle',
  },
  notes_bundle_299: {
    name: 'Christmas Notes Bundle - All 4 Designs - $2.99',
    description: 'All 4 Christmas note designs',
    amount: 299,
    stripePriceId: 'price_1ScH30Bsr66TjEhQhwLwFAME',
    productType: 'notes_bundle',
  },
  complete_bundle_999: {
    name: 'All 18 Designs Bundle - $9.99',
    description: '14 Santa letters + 4 Christmas notes',
    amount: 999,
    stripePriceId: 'price_1ScGjvBsr66TjEhQ4cRtPYm1',
    productType: 'complete_bundle',
  },
  teacher_license_499: {
    name: 'Teacher License – $4.99 (One-Time)',
    description: 'Unlimited classroom printing + all 14 Santa letters',
    amount: 499,
    stripePriceId: 'price_1ScH6KBsr66TjEhQAhED4Lsd',
    productType: 'teacher_license',
  },
};

Deno.serve(async (req: Request) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    if (!stripeSecret || !stripe) {
      console.error('Stripe secret key missing or Stripe client not created');
      return new Response(
        JSON.stringify({
          error:
            'Payment system is not configured. Please contact support if this continues.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { productId, customerEmail, designNumber }: CheckoutRequest =
      await req.json();

    if (!productId || !customerEmail) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: productId and customerEmail',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Single letter requires a design number so you know which file to send
    if (productId === 'single_letter_99' && !designNumber) {
      return new Response(
        JSON.stringify({
          error: 'designNumber is required for a single Santa letter purchase',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const product = PRODUCT_CONFIG[productId];
    if (!product) {
      console.error('Invalid productId:', productId);
      return new Response(
        JSON.stringify({ error: 'Invalid product ID' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        product_type: product.productType,
        product_id: productId,
        amount: product.amount,
        status: 'pending',
        download_links: [],
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Failed to create order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Derive origin safely (fixes the "origin is not defined" errors)
    const url = new URL(req.url);
    const originHeader = req.headers.get('origin');
    const origin = originHeader ?? `${url.protocol}//${url.host}`;

    // Create Stripe Checkout session using your saved Prices
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.stripePriceId,
          quantity: 1,
        },
      ],
      // This shows the promo-code box on the Stripe page
      allow_promotion_codes: true,
      customer_email: customerEmail,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      metadata: {
        order_id: order.id.toString(),
        product_type: product.productType,
        product_id: productId,
        design_number: designNumber?.toString() ?? '',
      },
    });

    // Store Stripe session info on the order (non-fatal if it fails)
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
        'Non-fatal: failed to update order after Stripe session create:',
        updateError,
      );
    }

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (err: any) {
    console.error('Payment error:', err);
    return new Response(
      JSON.stringify({
        error: `Payment error: ${err?.message ?? 'Unknown error'}`,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
