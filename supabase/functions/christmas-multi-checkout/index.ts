// supabase/functions/christmas-multi-checkout/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidEmail(email: string) {
  return !!email && email.includes("@") && email.includes(".");
}

function toCents(input: unknown): number | null {
  // accepts 0.99 (number), "0.99" (string), 99, "99"
  if (input === null || input === undefined) return null;

  if (typeof input === "number") {
    // If already looks like cents (>= 50 and integer), keep it
    if (Number.isInteger(input) && input >= 50) return input;
    // Otherwise treat as dollars
    return Math.round(input * 100);
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    if (Number.isNaN(num)) return null;

    // If string is "99" treat as cents when integer and >= 50
    if (Number.isInteger(num) && num >= 50) return num;

    // Otherwise treat as dollars like "0.99"
    return Math.round(num * 100);
  }

  return null;
}

type CartItem = {
  type?: string;
  quantity?: number;

  // common fields you showed:
  designNumber?: number;
  noteNumber?: number;
  name?: string;

  // possible pricing fields:
  priceId?: string;
  price_id?: string;
  stripePriceId?: string;

  unitAmount?: number | string;
  unitAmountCents?: number | string;
  price?: number | string;
  priceCents?: number | string;

  // sometimes devs send:
  productId?: string;
  product_id?: string;
};

const PRICE_IDS = {
  santa_letter_single: "price_1ScHCUBsr66TjEhQI5HBQqtU",
  christmas_note_single: "price_1ScGfNBsr66TjEhQxdfKXMcn",
  christmas_notes_bundle: "price_1ScH30Bsr66TjEhQhwLwFAME",
  all_18_bundle: "price_1ScGjvBsr66TjEhQ4cRtPYm1",
  teacher_license: "price_1ScH6KBsr66TjEhQAhED4Lsd",
  free_coloring: "price_1SctvEBsr66TjEhQ5XQ8NUxl",
};

function derivePriceId(item: CartItem): string | null {
  const t = (item.type || "").toLowerCase();

  // Map whatever your UI uses into the real Stripe price IDs.
  // Add more aliases here if your app uses different strings.
  if (t.includes("santa") || t.includes("letter")) return PRICE_IDS.santa_letter_single;
  if (t.includes("note") && t.includes("bundle")) return PRICE_IDS.christmas_notes_bundle;
  if (t.includes("note")) return PRICE_IDS.christmas_note_single;
  if (t.includes("18") || t.includes("all") || t.includes("designs") || t.includes("bundle")) return PRICE_IDS.all_18_bundle;
  if (t.includes("teacher")) return PRICE_IDS.teacher_license;
  if (t.includes("color")) return PRICE_IDS.free_coloring;

  return null;
}

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("SUPABASE_DB_URL");
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey) return json({ error: "Missing STRIPE_SECRET_KEY" }, 500);
    if (!supabaseUrl) return json({ error: "Missing SUPABASE_URL (or SUPABASE_DB_URL)" }, 500);
    if (!supabaseServiceRole) return json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, 500);

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-09-30.acacia" });

    const body = await req.json().catch(() => null);
    if (!body) return json({ error: "Invalid JSON body" }, 400);

    const customerEmail = (body.email || body.customerEmail || "").toString().trim();
    const items: CartItem[] = Array.isArray(body.items) ? body.items : [];

    if (!isValidEmail(customerEmail)) {
      return json({ error: "Invalid email", details: "Provide a valid email address" }, 400);
    }
    if (!items.length) {
      return json({ error: "Cart empty", details: "No items provided" }, 400);
    }

    // Normalize items into Stripe line_items using Price IDs when possible.
    const normalized = items.map((item) => {
      const qty = Number(item.quantity ?? 1) || 1;

      const explicitPriceId =
        item.priceId ||
        item.price_id ||
        item.stripePriceId ||
        null;

      const derivedPriceId = explicitPriceId || derivePriceId(item);

      // If we have a priceId, use it (recommended)
      if (derivedPriceId) {
        return {
          ok: true as const,
          lineItem: { price: derivedPriceId, quantity: qty },
          cents: null as number | null,
          used: "price" as const,
        };
      }

      // Otherwise fallback to amount
      const cents =
        toCents(item.unitAmountCents) ??
        toCents(item.unitAmount) ??
        toCents(item.priceCents) ??
        toCents(item.price);

      if (!cents || cents <= 0) {
        return {
          ok: false as const,
          reason:
            "Item missing priceId and unit amount. Your cart items must include a Stripe price id (priceId/price_id) OR an amount field (unitAmount/unitAmountCents/price/priceCents).",
          receivedKeys: Object.keys(item || {}),
          exampleExpected: { priceId: "price_123", quantity: 1 },
        };
      }

      return {
        ok: true as const,
        lineItem: {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name || item.type || "ChristmasFun Item",
            },
            unit_amount: cents,
          },
          quantity: qty,
        },
        cents,
        used: "amount" as const,
      };
    });

    const firstBad = normalized.find((x: any) => !x.ok);
    if (firstBad) {
      return json({ error: "Invalid item", details: firstBad.reason, receivedKeys: firstBad.receivedKeys, exampleExpected: firstBad.exampleExpected }, 400);
    }

    const line_items = normalized.map((x: any) => x.lineItem);

    // Calculate total cents if we used amount fallback anywhere.
    // If everything used price IDs, we can keep amount as null/0 and rely on Stripe for totals.
    const fallbackCentsTotal = normalized
      .filter((x: any) => x.used === "amount")
      .reduce((sum: number, x: any) => sum + (x.cents ?? 0) * (x.lineItem.quantity ?? 1), 0);

    const supabase = createClient(supabaseUrl, supabaseServiceRole, {
      auth: { persistSession: false },
    });

    // Create order record (customer_email column)
    const orderPayload: Record<string, unknown> = {
      customer_email: customerEmail,
      status: "pending",
      currency: "usd",
      // Store cents as integer if you have an amount column (integer)
      amount_cents: fallbackCentsTotal || null,
      items,
      created_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderPayload)
      .select("*")
      .single();

    if (orderError || !order) {
      return json(
        {
          error: "Failed to create order",
          details: orderError?.message || orderError || "Unknown error",
        },
        500,
      );
    }

    const url = new URL(req.url);
    const origin = req.headers.get("origin") ?? `${url.protocol}//${url.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      customer_email: customerEmail,
      line_items,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart-cancelled`,
      metadata: {
        order_id: String((order as any).id ?? ""),
        customer_email: customerEmail,
      },
      client_reference_id: String((order as any).id ?? ""),
    });

    // Save session id on the order (optional)
    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", (order as any).id);

    return json({ url: session.url, sessionId: session.id, orderId: (order as any).id });
  } catch (err) {
    return json({ error: "Server error", details: err instanceof Error ? err.message : String(err) }, 500);
  }
});
