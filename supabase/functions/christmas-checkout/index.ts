import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PRODUCT_TO_PRICE: Record<string, string> = {
  'bundle_14_999': 'price_1ScGjvBsr66TjEhQ4cRtPYm1',
  'all_18_bundle': 'price_1ScGjvBsr66TjEhQ4cRtPYm1',
  'notes_bundle_299': 'price_1ScH30Bsr66TjEhQhwLwFAME',
  'christmas_notes_bundle': 'price_1ScH30Bsr66TjEhQhwLwFAME',
  'teacher_license_499': 'price_1ScH6KBsr66TjEhQAhED4Lsd',
  'teacher_license': 'price_1ScH6KBsr66TjEhQAhED4Lsd',
  'santa_letter': 'price_1ScHCUBsr66TjEhQI5HBQqtU',
  'christmas_note': 'price_1ScGfNBsr66TjEhQxdfKXMcn',
  'free_coloring': 'price_1SctvEBsr66TjEhQ5XQ8NUxl',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
    if (!STRIPE_SECRET_KEY) {
      return json({ error: "Missing STRIPE_SECRET_KEY" }, 500);
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const body = await req.json();

    const email = (body.email || body.customerEmail || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return json({ error: "Invalid email" }, 400);
    }

    let priceId = body.priceId;
    const productId = body.productId;

    if (!priceId && productId) {
      priceId = PRODUCT_TO_PRICE[productId];
    }

    if (!priceId) {
      return json({ error: "Missing priceId or valid productId" }, 400);
    }

    const origin = req.headers.get("origin") || "https://christmasfun.store";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        product_id: productId || priceId,
        source: "christmasfun.store",
      },
    });

    if (!session.url) {
      return json({ error: "Failed to create checkout session" }, 500);
    }

    return json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("christmas-checkout error:", message);
    return json({ error: "Checkout failed", details: message }, 500);
  }
});
