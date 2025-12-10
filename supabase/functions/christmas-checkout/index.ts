import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@14.21.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');

const stripe = stripeSecret ? new Stripe(stripeSecret, {
  apiVersion: '2023-10-16',
}) : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CheckoutRequest {
  productId: 'single_letter_99' | 'bundle_14_999' | 'notes_bundle_299' | 'complete_bundle_999' | 'teacher_license_499' | 'coloring_bundle_free';
  customerEmail: string;
  designNumber?: number;
}

const PRODUCT_CONFIG = {
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
  coloring_bundle_free: {
    name: 'Free Coloring Sheets Bundle',
    amount: 0,
    description: '10 beautiful coloring sheets',
  },
};

Deno.serve(async (req: Request) => {
  try {
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
        }
      );
    }

    if (!stripeSecret) {
      console.error('STRIPE_SECRET_KEY is missing');
      return new Response(
        JSON.stringify({ error: 'Payment system not configured. Please contact support.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!stripe) {
      console.error('Stripe client failed to initialize');
      return new Response(
        JSON.stringify({ error: 'Payment system error. Please try again.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { productId, customerEmail, designNumber }: CheckoutRequest = await req.json();

    if (!productId || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: productId and customerEmail' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (productId === 'single_letter_99' && !designNumber) {
      return new Response(
        JSON.stringify({ error: 'designNumber is required for single letter purchases' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const product = PRODUCT_CONFIG[productId];
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Invalid product ID' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let productType = 'single_letter';
    if (productId.includes('teacher')) {
      productType = 'teacher_license';
    } else if (productId.includes('coloring')) {
      productType = 'coloring_bundle';
    } else if (productId === 'notes_bundle_299') {
      productType = 'notes_bundle';
    } else if (productId === 'complete_bundle_999') {
      productType = 'complete_bundle';
    } else if (productId.includes('bundle')) {
      productType = 'bundle';
    }

  // Create order record in Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        product_type: productType,
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

    // Create Stripe Checkout Session
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
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}`,
      customer_email: customerEmail,
      metadata: {
        // IMPORTANT: this must come from the order row we just inserted
        order_id: order.id.toString(),
        product_type: productType,
        product_id: productId.toString(),
        design_number: designNumber?.toString() ?? '',
      },
    });

    // Store Stripe session details on the order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        stripe_session_id: session.id,
        checkout_url: session.url,
      })
      .eq('id', order.id);

    if (updateError) {
      console.error(
        'Failed to update order with Stripe session:',
        updateError,
      );
      return new Response(
        JSON.stringify({
          error: 'Failed to link order with payment session',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
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
