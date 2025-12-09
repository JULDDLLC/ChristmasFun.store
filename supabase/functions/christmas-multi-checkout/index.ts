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

interface CartItem {
  type: 'santa_letter' | 'christmas_note';
  designNumber?: number;
  noteNumber?: number;
  name: string;
  price: number;
}

interface CheckoutRequest {
  items: CartItem[];
  customerEmail: string;
}

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

    const { items, customerEmail }: CheckoutRequest = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0 || !customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: items array and customerEmail' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const totalAmount = items.reduce((sum, item) => sum + Math.round(item.price * 100), 0);

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.type === 'santa_letter'
            ? `Santa Letter Design #${item.designNumber}`
            : `Christmas Note #${item.noteNumber}`,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    }));

    const productType = 'multi_item_cart';
    const itemsSummary = items.map(item => {
      if (item.type === 'santa_letter') {
        return `letter_${item.designNumber}`;
      } else {
        return `note_${item.noteNumber}`;
      }
    }).join(',');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        product_type: productType,
        product_id: `cart_${items.length}_items`,
        amount: totalAmount,
        status: 'pending',
        download_links: [],
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const origin = req.headers.get('origin') || 'https://christmasmagicdesigns.juldd.com';

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}`,
        customer_email: customerEmail,
        metadata: {
          orderId: order.id,
          productType,
          itemCount: items.length.toString(),
          items: itemsSummary,
        },
      });

      await supabase
        .from('orders')
        .update({ stripe_session_id: session.id })
        .eq('id', order.id);

      return new Response(
        JSON.stringify({ sessionId: session.id, url: session.url }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (stripeError: any) {
      console.error('Stripe session creation failed:', stripeError.message, stripeError.type, stripeError.code);

      await supabase
        .from('orders')
        .delete()
        .eq('id', order.id);

      return new Response(
        JSON.stringify({ error: `Payment error: ${stripeError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});