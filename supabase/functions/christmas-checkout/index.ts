import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { productId, priceId, email } = await req.json();

    if (!priceId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing priceId or email" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Create Stripe checkout
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/thank-you`,
      cancel_url: req.headers.get("origin")!,
    });

    // Insert order WITHOUT amount_cents
    await supabase.from("orders").insert({
      customer_email: email,
      product_id: productId || null,
      status: "pending",
      stripe_session_id: session.id,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("checkout error", err);
    return new Response(
      JSON.stringify({ error: "Checkout failed" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
