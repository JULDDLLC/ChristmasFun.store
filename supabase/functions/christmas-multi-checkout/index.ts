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
    const { items, email } = await req.json();

    if (!Array.isArray(items) || items.length === 0 || !email) {
      return new Response(
        JSON.stringify({ error: "Invalid cart or email" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const lineItems = items.map((item) => ({
      price: item.priceId,
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      customer_email: email,
      line_items: lineItems,
      success_url: `${req.headers.get("origin")}/thank-you`,
      cancel_url: req.headers.get("origin")!,
    });

    await supabase.from("orders").insert({
      customer_email: email,
      status: "pending",
      stripe_session_id: session.id,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("multi checkout error", err);
    return new Response(
      JSON.stringify({ error: "Checkout failed" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
