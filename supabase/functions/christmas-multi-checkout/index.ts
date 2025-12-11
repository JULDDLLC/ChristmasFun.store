// supabase/functions/christmas-multi-checkout/index.ts

import Stripe from "https://esm.sh/stripe@12.8.0?target=deno";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not set in Supabase secrets");
}

const stripe = new Stripe(stripeSecretKey ?? "", {
  apiVersion: "2023-10-16",
});

interface CartItem {
  type: string;
  designNumber?: number | null;
  noteNumber?: number | null;
  name: string;
  price: number;
}

interface RequestBody {
  items: CartItem[];
  customerEmail: string;
}

const PRICE_IDS: Record<string, string> = {
  // singles
  santa_letter: "price_1ScHCUBsr66TjEhQI5HBQqtU",
  christmas_note: "price_1ScGfNBsr66TjEhQxdfKXMcn",

  // bundles and extras, in case they appear in the cart
  notes_bundle: "price_1ScH30Bsr66TjEhQhwLwFAME",
  all_18_bundle: "price_1ScGjvBsr66TjEhQ4cRtPYm1",
  teacher_license: "price_1ScH6KBsr66TjEhQAhED4Lsd",
  free_coloring: "price_1SctvEBsr66TjEhQ5XQ8NUxl",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Stripe is not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const body = (await req.json()) as RequestBody;
    const { items, customerEmail } = body;

    if (!customerEmail || !customerEmail.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Build Stripe line items from cart items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items) {
      const priceId = PRICE_IDS[item.type];

      if (!priceId) {
        console.error("Unsupported cart item type:", item.type, item);
        return new Response(
          JSON.stringify({
            error: `Unsupported item type: ${item.type}`,
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      lineItems.push({
        price: priceId,
        quantity: 1,
      });
    }

    const origin =
      req.headers.get("origin") ??
      "https://christmasfun.store";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#cart-cancelled`,
      metadata: {
        source: "christmas-multi-checkout",
      },
    });

    if (!session.url) {
      console.error("Stripe session created without URL", session);
      return new Response(
        JSON.stringify({
          error: "Failed to create checkout session",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.error("Error in christmas-multi-checkout:", err);

    return new Response(
      JSON.stringify({ error: "Failed to create order" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
