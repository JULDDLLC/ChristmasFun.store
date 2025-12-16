/// <reference types="npm:@types/node" />

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function getEnv(keys: string[]) {
  for (const k of keys) {
    const v = (Deno.env.get(k) || "").trim();
    if (v) return v;
  }
  return "";
}

// IMPORTANT: Keep all money values in CENTS (integers)
function toCents(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    // if they sent 0.99, convert to 99
    if (value > 0 && value < 10) return Math.round(value * 100);
    return Math.round(value);
  }

  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return 0;
    // "0.99" -> 99, "99" -> 99
    const n = Number(s);
    if (Number.isFinite(n)) {
      if (n > 0 && n < 10) return Math.round(n * 100);
      return Math.round(n);
    }
  }

  return 0;
}

type IncomingItem = {
  priceId?: string;
  quantity?: number;
  // optional fallback if your frontend sends these:
  unitAmountCents?: number | string; // already cents, or "0.99"
  unitAmount?: number | string; // dollars like 0.99
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = getEnv(["SUPABASE_URL"]);
    const supabaseServiceRoleKey = getEnv([
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_SERVICE_ROLE",
    ]);
    const stripeSecretKey = getEnv(["STRIPE_SECRET_KEY"]);

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({
          error: "Missing Supabase env vars",
          details: {
            SUPABASE_URL: !!supabaseUrl,
            SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceRoleKey,
          },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-09-30.acacia" });

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    const body = await req.json().catch(() => ({}));

    const customerEmail = String(body?.email || body?.customerEmail || "").trim();
    const items: IncomingItem[] = Array.isArray(body?.items) ? body.items : [];

    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: "Missing customer email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!items.length) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const productIds: string[] = [];

    let totalAmountCents = 0;

    for (const it of items) {
      const quantity = Math.max(1, Number(it?.quantity || 1));

      const priceId = String(it?.priceId || "").trim();
      if (priceId) {
        lineItems.push({ price: priceId, quantity });
        productIds.push(priceId);
      } else {
        // fallback if frontend is not passing price IDs
        const cents =
          toCents(it?.unitAmountCents) ||
          toCents(it?.unitAmount);

        if (!cents) {
          return new Response(
            JSON.stringify({
              error: "Invalid item",
              details: "Item missing priceId and unit amount",
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: { name: "ChristmasFun item" },
            unit_amount: cents,
          },
          quantity,
        });

        totalAmountCents += cents * quantity;
        productIds.push("custom_amount_item");
      }
    }

    // Insert order FIRST (use your real column name: customer_email)
    // IMPORTANT: store amount as integer cents, never "0.99"
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: customerEmail, // <-- FIXED (was "email" in your error)
        status: "pending",
        amount: totalAmountCents, // <-- FIXED (integer cents)
        currency: "usd",
        product_ids: productIds,
        download_links: [],
      })
      .select()
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({
          error: "Failed to create order",
          details: orderError?.message || orderError || "Unknown order error",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const origin = req.headers.get("origin") ?? `${url.protocol}//${url.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      customer_email: customerEmail,
      line_items: lineItems,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart-cancelled`,
      metadata: {
        order_id: String(order.id),
        customer_email: customerEmail,
      },
    });

    // (Optional) store session id on the order if your table has the column
    // await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return new Response(
      JSON.stringify({ url: session.url, orderId: order.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in christmas-multi-checkout:", err);
    return new Response(
      JSON.stringify({ error: "Checkout failed", details: String((err as any)?.message || err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
