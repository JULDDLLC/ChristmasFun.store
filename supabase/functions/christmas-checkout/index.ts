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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Client-Info, Apikey',
};

// ---------- Types ----------

interface CheckoutRequest {
  productId:
    | 'single_letter_99'
    | 'bundle_14_999'
    | 'notes_bundle_299'
    | 'complete_bundle_999'
    | 'teacher_license_499'
    | 'coloring_bundle_free';
  customerEmail: string;
  designNumber?: number;
}

const PRODUCT_CONFIG: Record<
  CheckoutRequest['productId'],
  { name: string; amount: number; description: string }
> = {
  single_letter_99: {
    name: 'Single Santa Letter Design',
    amount: 99, // cents
    description: 'One premium Santa letter design',
  },
  bundle_14_999: {
    name: 'Santa Letters Bundle - All 14 Designs',
    amount: 999,
    description: 'All 14 Santa letter designs',
  },
  notes_bundle_299: {
    name: 'Christmas Notes Bundle - All 4 Designs',
    amount: 299,
    description: 'All 4 Christmas note designs',
  },
  complete_bundle_999: {
    name: 'Complete Bundle - All 18 Designs',
    amount: 999,
    description: '14 Santa letters + 4 Christmas notes',
  },
  teacher_license_499: {
    name: 'Teacher License + All Designs',
    amount: 499,
    description:
      'Unlimited classroom printing + all 14 Santa letters + notes bundle',
  },
  coloring_bundle_free: {
    name: 'Free Coloring Sheets Bundle',
    amount: 0,
    description: '10 beautiful coloring sheets',
  },
};

// ---------- Main handler ----------

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

    let body: CheckoutRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const { productId, customerEmail, designNumber } = body;

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

    if (productId === 'single_letter_99' && !designNumber) {
      return new Response(
        JSON.stringify({
          error: 'designNumber is required for single letter purchases',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const product = PRODUCT_CONFIG[productId];
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Invalid product ID' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Figure out product_type for the orders table
    let productType = 'single_letter';
    if (productId === 'notes_bundle_299') productType = 'notes_bundle';
    else if (productId === 'complete_bundle_999') productType = 'complete_bundle';
    else if (productId === 'teacher_license_499') productType = 'teacher_license';
    else if (productId === 'coloring_bundle_free') productType = 'coloring_bundle';
    else if (productId.includes('bundle')) productType = 'bundle';

    // ---------- 1) Create order in Supabase ----------

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        product_type: productType,
        product_id: productId,
        amount: product.amount,
        status: product.amount === 0 ? 'completed' : 'pending',
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

    // ---------- 2) FREE PRODUCT: skip Stripe completely ----------

    if (product.amount === 0) {
      // Your frontend can still call the Resend function to email the files,
      // but checkout itself is "done" here – no Stripe needed.
      return new Response(
        JSON.stringify({
          ok: true,
          free: true,
          orderId: order.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // ---------- 3) PAID PRODUCTS: create Stripe Checkout session ----------

    if (!stripe) {
      console.error('Stripe not configured');
      return new Response(
        JSON.stringify({
          error: 'Payment system not configured. Please contact support.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const url = new URL(req.url);
    const originHeader = req.headers.get('origin');
    const origin = originHeader ?? `${url.protocol}//${url.host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount, // cents
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      customer_email: customerEmail,
      metadata: {
        order_id: order.id.toString(),
        product_type: productType,
        product_id: productId.toString(),
        design_number: designNumber?.toString() ?? '',
      },
    });

    // Optional: update order status, but DO NOT fail checkout if this breaks
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'checkout_created' })
      .eq('id', order.id);

    if (updateError) {
      console.error('Non-fatal: failed to update order after Stripe:', updateError);
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
