import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@14.21.0';

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

const PRODUCT_CONFIG: Record<
  ProductId,
  { name: string; description: string; priceId: string }
> = {
  // Single Santa letter - 0.99
  single_letter_99: {
    name: 'Single Santa Letter Design',
    description: 'One premium Santa letter design',
    priceId: 'price_1ScHCUBsr66TjEhQI5HBQqtU',
  },

  // 14 Santa letters bundle - using your All 18 price for now
  bundle_14_999: {
    name: 'Santa Letters Bundle - All 14 Designs',
    description: 'All 14 Santa letter designs',
    priceId: 'price_1ScGjvBsr66TjEhQ4cRtPYm1',
  },

  // Christmas Notes bundle - 2.99
  notes_bundle_299: {
    name: 'Christmas Notes Bundle - All 4 Designs',
    description: 'All 4 Christmas note designs',
    priceId: 'price_1ScH30Bsr66TjEhQhwLwFAME',
  },

  // Complete bundle - all 18 designs - 9.99
  complete_bundle_999: {
    name: 'Complete Bundle - All 18 Designs',
    description: '14 Santa letters + 4 Christmas notes',
    priceId: 'price_1ScGjvBsr66TjEhQ4cRtPYm1',
  },

  // Teacher license - 4.99
  teacher_license_499: {
    name: 'Teacher License + All Designs',
    description: 'Unlimited classroom printing + all 14 Santa letters',
    priceId: 'price_1ScH6KBsr66TjEhQAhED4Lsd',
  },
};

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight
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

    if (!stripe || !stripeSecret) {
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

    if (!product) {
      console.error('Invalid product configuration for id:', productId);
      return new Response(
        JSON.stringify({ error: 'Invalid product ID' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Determine origin for redirect URLs
    const url = new URL(req.url);
    const originHeader = req.headers.get('origin');
    const origin = originHeader ?? `${url.protocol}//${url.host}`;

    // Create Stripe Checkout Session using your catalog price
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      metadata: {
        product_id: productId,
        design_number: designNumber?.toString() ?? '',
      },
    });

    // Return session info to frontend
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
