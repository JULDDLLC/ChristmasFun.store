// supabase/functions/christmas-multi-checkout/index.ts

import Stripe from "stripe";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-09-30.acacia",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// 🔐 STRIPE PRICE MAP (SOURCE OF TRUTH)
const PRICE_MAP: Record<string, string> = {
  santa_letter_single: "price_1ScHCUBsr66TjEhQI5HBQqtU",
  christmas_note_single: "price_1ScGfNBsr66TjEhQxdfKXMcn",
  christmas_notes_bundle: "price_1ScH30Bsr66TjEhQhwLwFAME",
  all_18_bundle: "price_1ScGjvBsr66TjEhQ4cRtPYm1",
  teacher_license: "price_1ScH6KBsr66TjEhQAhED4Lsd",
  free_coloring: "price_1SctvEBsr66TjEhQ5XQ8NUxl",
};

serve(async (req) => {
  try {
    const { items, email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Missing email" }),
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        { status: 400 }
      );
    }

    // ✅ Build Stripe line items STRICTLY by priceId
    const line_items = items.map((item) => {
      const priceId = PRICE_MAP[item.productKey];

      if (!priceId) {
        throw new Error(`Invalid productKey: ${item.productKey}`);
      }

      return {
        price: priceId,
        quantity: item.quantity ?? 1,
      };
    });

    // 🧾 Create order FIRST
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_email: email,
        status: "pending",
        items,
      })
      .select()
      .single();

    if (error) {
      console.error("Order insert failed", error);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500 }
      );
    }

    const origin = req.headers.get("origin") ?? "https://christmasfun.store";

    // 💳 Create Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      allow_promotion_codes: true,
      line_items,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: {
        order_id: order.id,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Checkout error", err);
    return new Response(
      JSON.stringify({
        error: "Invalid item",
        details: err.message,
      }),
      { status: 400 }
    );
  }
});
