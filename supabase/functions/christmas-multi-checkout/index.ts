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

// Always return integer cents
function toCents(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 0 && value < 10) return Math.round(value * 100);
    return Math.round(value);
  }
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return 0;
    const n = Number(s);
    if (Number.isFinite(n)) {
      if (n > 0 && n < 10) return Math.round(n * 100);
      return Math.round(n);
    }
  }
  return 0;
}

type AnyObj = Record<string, any>;

function pickPriceId(item: AnyObj): string {
  const candidates = [
    item.priceId,
    item.price_id,
    item.price,
    item.stripePriceId,
    item.stripe_price_id,
  ];
  const found = candidates.find((v) => typeof v === "string" && v.trim());
  return (found || "").trim();
}

function pickQuantity(item: AnyObj): number {
  const q = Number(item.quantity ?? item.qty ?? 1);
  return Number.isFinite(q) && q > 0 ? Math.floor(q) : 1;
}

function pickUnitCents(item: AnyObj): number {
  // Try cents-style keys first
  const centsCandidates = [
    item.unitAmountCents,
    item.unit_amount_cents,
    item.amountCents,
    item.amount_cents,
    item.totalAmountCents,
    item.total_amount_cents,
  ];
  for (const v of centsCandidates) {
    const c = toCents(v);
    if (c) return c;
  }

  // Then dollar-style keys
  const dollarCandidates = [
    item.unitAmount,
    item.unit_amount,
    item.amount,
    item.priceAmount,
    item.price_amount,
  ];
  for (const v of dollarCandidates) {
    const c = toCents(v);
    if (c) return c;
  }

  return 0;
}

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
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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

    const body = (await req.json().catch(() => ({}))) as AnyObj;

    const customerEmail = String(body.email || body.customerEmail || "").trim();
    const items = Array.isArray(body.items) ? body.items : [];

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

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const productIds: string[] = [];

    // We need an integer cents total for the DB
    let totalAmountCents = 0;

    // Cache Stripe price lookups so we can compute cents even when only priceId is sent
    const priceCache = new Map<string, number>();

    for (const raw of items) {
      const item = raw as AnyObj;
      const quantity = pickQuantity(item);
      const priceId = pickPriceId(item);

      if (priceId) {
        lineItems.push({ price: priceId, quantity });
        productIds.push(priceId);

        // Try to compute total cents by fetching the Stripe Price
        if (!priceCache.has(priceId)) {
          try {
            const p = await stripe.prices.retrieve(priceId);
            const unit = typeof p.unit_amount === "number" ? p.unit_amount : 0;
            priceCache.set(priceId, unit);
          } catch {
            priceCache.set(priceId, 0);
          }
        }

        const unit = priceCache.get(priceId) || 0;
        totalAmountCents += unit * quantity;

        continue;
      }

      // No priceId, so we require some amount field
      const unitCents = pickUnitCents(item);

      if (!unitCents) {
        return new Response(
          JSON.stringify({
            error: "Invalid item",
            details:
              "Item missing priceId and unit amount. Your cart items must include a Stripe price id (priceId/price_id) OR an amount field (unitAmount/unitAmountCents).",
            receivedKeys: Object.keys(item || {}),
            exampleExpected: {
              priceId: "price_123",
              quantity: 1,
            },
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: item.name || "ChristmasFun item" },
          unit_amount: unitCents,
        },
        quantity,
      });

      totalAmountCents += unitCents * quantity;
      productIds.push(item.productId || item.product_id || "custom_amount_item");
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: customerEmail,
        status: "pending",
        amount: totalAmountCents,
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

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in christmas-multi-checkout:", err);
    return new Response(
      JSON.stringify({ error: "Checkout failed", details: String((err as any)?.message || err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
