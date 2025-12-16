/// <reference types="npm:@types/node" />

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function getEnv(keys: string[]) {
  for (const k of keys) {
    const v = (Deno.env.get(k) || "").trim();
    if (v) return v;
  }
  return "";
}

const STRIPE_SECRET_KEY = getEnv(["STRIPE_SECRET_KEY"]);
const SUPABASE_URL = getEnv(["SUPABASE_URL", "VITE_SUPABASE_URL"]);

// Prefer service role, but allow anon fallback if your `orders` table permits it via RLS policy
const SUPABASE_SERVICE_ROLE_KEY = getEnv(["SUPABASE_SERVICE_ROLE_KEY"]);
const SUPABASE_ANON_KEY = getEnv(["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]);

const supabaseKeyToUse = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

interface CartItem {
  type: string;
  designNumber?: number | null;
  noteNumber?: number | null;
  name: string;
  // price is in DOLLARS in your frontend (e.g., 0.99, 9.99)
  price: number;
}

interface RequestBody {
  items: CartItem[];
  customerEmail: string;
}

const PRICE_IDS: Record<string, string> = {
  santa_letter: "price_1ScHCUBsr66TjEhQI5HBQqtU",
  christmas_note: "price_1ScGfNBsr66TjEhQxdfKXMcn",
  notes_bundle: "price_1ScH30Bsr66TjEhQhwLwFAME",
  all_18_bundle: "price_1ScGjvBsr66TjEhQ4cRtPYm1",
  teacher_license: "price_1ScH6KBsr66TjEhQAhED4Lsd",
  free_coloring: "price_1SctvEBsr66TjEhQ5XQ8NUxl",
};

// Convert dollars -> integer cents safely
function dollarsToCents(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Hard fail with a clear message if config is missing
  const missing: string[] = [];
  if (!STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
  if (!SUPABASE_URL) missing.push("SUPABASE_URL (or VITE_SUPABASE_URL)");
  if (!supabaseKeyToUse) missing.push("SUPABASE_SERVICE_ROLE_KEY (preferred) or VITE_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    console.error("Config error. Missing:", missing);
    return new Response(
      JSON.stringify({
        error: "Configuration error. Missing required environment variables.",
        missing,
        note:
          "In Bolt, add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Server Function secrets. If you cannot, anon key fallback can work only if your orders table allows insert/update for anon via RLS.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(SUPABASE_URL, supabaseKeyToUse);

  try {
    const body = (await req.json()) as RequestBody;
    const { items, customerEmail } = body;

    if (!customerEmail || !customerEmail.includes("@") || !customerEmail.includes(".")) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const item of items) {
      const priceId = PRICE_IDS[item.type];
      if (!priceId) {
        console.error("Unsupported cart item type:", item.type, item);
        return new Response(JSON.stringify({ error: `Unsupported item type: ${item.type}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      lineItems.push({ price: priceId, quantity: 1 });
    }

    // Frontend prices are dollars; DB `amount` is likely integer cents (your error shows integer).
    const totalAmountCents = items.reduce((sum, item) => sum + dollarsToCents(item.price), 0);

    // Keep a human-friendly string too (not used for DB insert)
    const totalAmountDollars = (totalAmountCents / 100).toFixed(2);

    const productIds = items.map((item) => item.type).join(",");

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: customerEmail,
        product_type: "multi_item_cart",
        product_id: productIds,
        // IMPORTANT: integer cents to match an integer column
        amount: totalAmountCents,
        status: "pending",
        download_links: [],
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({
          error: "Failed to create order",
          details: orderError?.message || "Unknown Supabase insert failure",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const origin = req.headers.get("origin") || "https://christmasfun.store";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: customerEmail,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#cart-cancelled`,
      metadata: {
        order_id: String(order.id),
        product_id: productIds,
        product_type: "multi_item_cart",
        source: "christmas-multi-checkout",
        // helpful for debugging/receipt sanity checks
        amount_cents: String(totalAmountCents),
        amount_dollars: totalAmountDollars,
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      console.error("Stripe session created without URL", session);
      return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order with session info
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        stripe_session_id: session.id,
        checkout_url: session.url,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Failed to update order with session:", updateError);
      // Do not fail checkout for this
    }

    return new Response(JSON.stringify({ url: session.url, order_id: order.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in christmas-multi-checkout:", err);
    return new Response(
      JSON.stringify({ error: "Checkout failed", details: String((err as any)?.message || err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
