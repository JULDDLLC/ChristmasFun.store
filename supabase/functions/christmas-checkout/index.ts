import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');

const stripe = stripeSecret
  ? new Stripe(stripeSecret, {
      apiVersion: '2023-10-16',
    })
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

const PRODUCT_CONFIG: Record<
  ProductId,
  { name: string; amount: number; description: string }
> = {
  single_letter_99: {
    name: 'Single Santa Letter Design',
    amount: 99,
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
    description: 'Unlimited classroom printing + all 14 Santa letters',
  },
};

// Map to your real Stripe price IDs
const STRIPE_PRICE_IDS: Record<ProductId, string> = {
  // Single Santa letter – $0.99
  single_letter_99: 'price_1ScHCUBsr66TjEhQI5HBQqtU',

  // For now I’m mapping both bundles to the All-18 price you gave.
  // If you later create a separate price for “14 letters only”,
  // just change the bundle_14_999 value.
  bundle_14_999: 'price_1ScGjvBsr66TjEhQ4cRtPYm1',

  // Christmas Notes Bundle – $2.99
  notes_bundle_299: 'price_1ScH30Bsr66TjEhQhwLwFAME',

  // All 18 Designs Bundle – $9.99
  complete_bundle_999: 'price_1ScGjvBsr66TjEhQ4cRtPYm1',

  // Teacher License – $4.99
  teacher_license_499: 'price_1ScH6KBsr66TjEhQAhED4Lsd',
};

Deno.serve(async (req: Request) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
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
      console.error('Stripe is not configured correctly');
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
    const priceId = STRIPE_PRICE_IDS[productId];

    if (!product || !priceId) {
      console.error('Invalid product configuration for id:', productId);
      return new Response(
        JSON.stringify({ error: 'Invalid product ID' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // 1) Create order record in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        product_type: productId,
        product_id: productId,
        amount: product.amount,
        status: 'pending',
        // download_links removed here
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

    // 2) Determine origin for redirect URLs
    const url = new URL(req.url);
    const originHeader = req.headers.get('origin');
    const origin = originHeader ?? `${url.protocol}//${url.host}`;

    // 3) Create Stripe Checkout Session using your catalog price
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      metadata: {
        order_id: order.id.toString(),
        product_type: productId,
        product_id: productId,
        design_number: designNumber?.toString() ?? '',
      },
    });

    // 4) Update order with session info
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
        'Non-fatal: failed to update order after Stripe:',
        updateError,
      );
      // Do NOT fail the checkout if this breaks
    }

    // 5) Return session info to frontend
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
