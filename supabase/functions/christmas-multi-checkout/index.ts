// supabase/functions/christmas-multi-checkout/index.ts

/// <reference deno-types="https://deno.land/x/types@v0.1.0/index.d.ts" />

import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type CartItem = {
  type?: string;
  name?: string;
  quantity?: number;

  // Common variants we might receive
  priceId?: string;
  price_id?: string;
  price?: number; // dollars (sometimes)
  priceCents?: number; // cents (best)
  unitAmount?: number; // cents
  unitAmountCents?: number; // cents

  designNumber?: number;
  noteNumber?: number;

  // Anything else
  [key: string]: unknown;
};

type RequestBody = {
  email?: string;
  customerEmail?: string;
  items?: CartItem[];
  cartItems?: CartItem[];
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Your Stripe Price IDs (source of truth)
const STRIPE_PRICE_IDS = {
  santa_letter_single: "price_1ScHCUBsr66TjEhQI5HBQqtU",
  christmas_note_single: "price_1ScGfNBsr66TjEhQxdfKXMcn",
  christmas_notes_bundle: "price_1ScH30Bsr66TjEhQhwLwFAME",
  all_18_designs_bundle: "price_1ScGjvBsr66TjEhQ4cRtPYm1",
  teacher_license: "price_1ScH6KBsr66TjEhQAhED4Lsd",
  free_coloring_sheets: "price_1SctvEBsr66TjEhQ5XQ8NUxl",
} as const;

function normalizeType(t?: string): string {
  return (t || "").trim().toLowerCase();
}

function deriveStripePriceId(item: CartItem): string | null {
  // If the item already includes a Stripe price id, use it
  const direct =
    (typeof item.priceId === "string" && item.priceId.trim()) ||
    (typeof item.price_id === "string" && item.price_id.trim());
  if (direct) return direct;

  // Otherwise derive from type
  const t = normalizeType(item.type);

  // Common mappings based on how these apps usually name types
  if (t === "santa_letter" || t === "santa-letter" || t === "letter") {
    return STRIPE_PRICE_IDS.santa_letter_single;
  }
  if (
    t === "christmas_note" ||
    t === "christmas-note" ||
    t === "note" ||
    t === "notes_single"
  ) {
    return STRIPE_PRICE_IDS.christmas_note_single;
  }
  if (t === "notes_bundle" || t === "christmas_notes_bundle" || t === "bundle_299") {
    return STRIPE_PRICE_IDS.christmas_notes_bundle;
  }
  if (
    t === "all_18_designs_bundle" ||
    t === "complete_bundle" ||
    t === "bundle_999" ||
    t === "all_designs_bundle"
  ) {
    return STRIPE_PRICE_IDS.all_18_designs_bundle;
  }
  if (t === "teacher_license" || t === "teacher-license" || t === "teacher") {
    return STRIPE_PRICE_IDS.teacher_license;
  }
  if (
    t === "free_coloring" ||
    t === "free_coloring_sheets" ||
    t === "coloring" ||
    t === "freebie"
  ) {
    return STRIPE_PRICE_IDS.free_coloring_sheets;
  }

  return null;
}

function getUnitAmountCents(item: CartItem): number | null {
  // Prefer explicit cents
  const candidates = [
    item.priceCents,
    item.unitAmountCents,
    item.unitAmount,
  ];

  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c) && c > 0) {
      return Math.round(c);
    }
  }

  // If only dollars provided
  if (typeof item.price === "number" && Number.isFinite(item.price) && item.price > 0) {
    return Math.round(item.price * 100);
  }

  return null;
}

function buildLineItem(item: CartItem) {
  const quantity = typeof item.quantity === "number" && item.quantity > 0
    ? Math.floor(item.quantity)
    : 1;

  const priceId = deriveStripePriceId(item);
  if (priceId) {
    return { price: priceId, quantity };
  }

  // Fallback: construct custom price_data from cents
  const cents = getUnitAmountCents(item);
  if (!cents) return null;

  const name = typeof item.name === "string" && item.name.trim()
    ? item.name.trim()
    : "ChristmasFun Item";

  return {
    price_data: {
      currency: "usd",
      product_data: { name },
      unit_amount: cents,
    },
    quantity,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!stripeSecretKey) {
      return jsonResponse({ error: "Missing STRIPE_SECRET_KEY" }, 500);
    }
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return jsonResponse(
        { error: "Missing Supabase env vars (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)" },
        500,
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-09-30.acacia" });

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    const body = (await req.json()) as RequestBody;

    const customerEmail =
      (typeof body.customerEmail === "string" && body.customerEmail.trim()) ||
      (typeof body.email === "string" && body.email.trim()) ||
      "";

    const items = Array.isArray(body.items)
      ? body.items
      : Array.isArray(body.cartItems)
        ? body.cartItems
        : [];

    if (!customerEmail) {
      return jsonResponse({ error: "Missing email" }, 400);
    }
    if (!items.length) {
      return jsonResponse({ error: "Cart is empty" }, 400);
    }

    // Validate and build Stripe line_items
    const line_items = [];
    const normalizedItemsForDb = [];
    const stripePriceIds: string[] = [];

    for (const item of items) {
      const li = buildLineItem(item);
      if (!li) {
        return jsonResponse(
          {
            error: "Invalid item",
            details:
              "Item missing priceId and unit amount. Your cart items must include a Stripe price id (priceId/price_id) OR an amount (priceCents/unitAmount/unitAmountCents/price).",
            receivedKeys: Object.keys(item || {}),
            exampleExpected: { priceId: "price_123", quantity: 1 },
          },
          400,
        );
      }

      line_items.push(li);

      const derivedPriceId = deriveStripePriceId(item);
      if (derivedPriceId) stripePriceIds.push(derivedPriceId);

      normalizedItemsForDb.push({
        type: item.type ?? null,
        name: item.name ?? null,
        quantity: typeof item.quantity === "number" ? item.quantity : 1,
        designNumber: typeof item.designNumber === "number" ? item.designNumber : null,
        noteNumber: typeof item.noteNumber === "number" ? item.noteNumber : null,
        priceCents: getUnitAmountCents(item),
        priceId: derivedPriceId,
      });
    }

    // Create an order row first (status pending)
    // IMPORTANT: use your column name customer_email (not email)
    const totalAmountCents = normalizedItemsForDb.reduce((sum, it) => {
      const cents = typeof it.priceCents === "number" ? it.priceCents : 0;
      const qty = typeof it.quantity === "number" ? it.quantity : 1;
      return sum + cents * qty;
    }, 0);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: customerEmail,
        status: "pending",
        amount_cents: totalAmountCents,
        currency: "usd",
        items: normalizedItemsForDb,
        product_ids: stripePriceIds.length ? stripePriceIds : null,
        download_links: [],
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order insert failed:", orderError);
      return jsonResponse(
        { error: "Failed to create order", details: orderError?.message ?? "Unknown error" },
        500,
      );
    }

    // Build success/cancel URLs
    const url = new URL(req.url);
    const origin = req.headers.get("origin") ?? `${url.protocol}//${url.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,
      allow_promotion_codes: true,
      line_items,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart-cancelled`,
      metadata: {
        order_id: String(order.id),
        customer_email: customerEmail,
      },
    });

    // Store session id on the order
    await supabase
      .from("orders")
      .update({
        stripe_session_id: session.id,
      })
      .eq("id", order.id);

    return jsonResponse({ url: session.url, order_id: order.id });
  } catch (err) {
    console.error("christmas-multi-checkout error:", err);
    return jsonResponse({ error: "Server error", details: String(err?.message ?? err) }, 500);
  }
});
