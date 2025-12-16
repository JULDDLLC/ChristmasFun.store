import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!supabaseUrl) {
      return new Response(JSON.stringify({ error: 'Missing SUPABASE_URL' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-09-30.acacia',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const customerEmail = (body?.customerEmail ?? '').toString().trim();

    if (!items.length) {
      return new Response(JSON.stringify({ error: 'No items provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'Missing customerEmail' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ✅ IMPORTANT FIX:
    // DB column "amount" is integer, so store cents (e.g. 0.99 -> 99).
    const totalAmountCents = items.reduce(
      (sum, item) => sum + Math.round((Number(item?.price) || 0) * 100),
      0
    );

    // (Optional) dollars version for logs only
    const totalAmount = totalAmountCents / 100;

    const productIds = items.map((i) => i?.id).filter(Boolean);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        email: customerEmail,
        status: 'pending',
        amount: totalAmountCents, // ✅ cents integer
        currency: 'usd',
        product_ids: productIds,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order insert failed:', orderError);
      return new Response(
        JSON.stringify({
          error: 'Failed to create order',
          details: orderError?.message ?? orderError ?? 'Unknown error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const lineItems = items.map((item) => {
      // Your items use Stripe Price IDs (recommended).
      // So we create session line_items using price + quantity.
      return {
        price: item.priceId,
        quantity: item.quantity ?? 1,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customerEmail,
      allow_promotion_codes: true,
      line_items: lineItems,
      metadata: {
        order_id: order.id,
      },
      success_url: `https://christmasfun.store/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://christmasfun.store/#cart-cancelled`,
    });

    if (!session?.url) {
      console.error('Stripe session created without URL', session);
      return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save Stripe session id on the order for webhook correlation (optional but helpful)
    const { error: updateError } = await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order with stripe_session_id:', updateError);
      // Not fatal to checkout flow
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unhandled error in christmas-multi-checkout:', err);
    return new Response(JSON.stringify({ error: 'Server error', details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
