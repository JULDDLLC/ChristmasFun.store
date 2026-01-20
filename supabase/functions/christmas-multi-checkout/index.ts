/// <reference types="npm:@types/node" />

import Stripe from "npm:stripe@14.21.0";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type CartItem = {
  // what your UI is sending right now (per your screenshot)
  type?: string;                 // 'santa_letter' | 'christmas_note' | etc
  designNumber?: number;
  noteNumber?: number;
  name?: string;
  price?: number;                // dollars
  priceCents?: number;           // cents
  quantity?: number;

  // also accept these if they ever exist
  priceId?: string;              // Stripe Price ID (preferred if present)
  unit_amount?: number;          // cents
};

type RequestBody = {
  email?: string;
  cartItems?: CartItem[];
  successUrl?: string;
  cancelUrl?: string;
  promoCode?: string;            // optional, we just enable promo codes in Stripe
};

const PRICE_ID_BY_TYPE: Record<string, string> = {
  santa_letter: "price_1ScHCUBsr66TjEhQI5HBQqtU",
  christmas_note: "price_1ScGfNBsr66TjEhQxdfKXMcn",
  christmas_notes_bundle: "price_1ScH30Bsr66TjEhQhwLwFAME",
  all_18_bundle: "price_1ScGjvBsr66TjEhQ4cRtPYm1",
  teacher_license: "price_1ScH6KBsr66TjEhQAhED4Lsd",
  free_coloring: "price_1SctvEBsr66TjEhQ5XQ8NUxl",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
  });
}

function normalizeEmail(v?: string) {
  return (v || "").trim().toLowerCase();
}

function buildLineItems(cartItems: CartItem[]) {
  // 1) If item has priceId, use it.
  // 2) Else map by item.type.
  // 3) Group by price id -> quantity.
  const counts = new Map<string, number>();

  for (const item of cartItems) {
    const qty = Math.max(1, Number(item.quantity || 1));

    const priceId =
      (item.priceId && String(item.priceId).trim()) ||
      (item.type && PRICE_ID_BY_TYPE[String(item.type).trim()]);

    if (!priceId) {
      // refuse cleanly: your UI is currently sending type/designNumber/priceCents only,
      // so this should NOT happen if type is set correctly
      throw new Error(
        `Cart item missing price mapping. Need item.priceId OR a supported item.type. Received keys: ${Object.keys(item || {}).join(", ")}`
      );
    }

    counts.set(priceId, (counts.get(priceId) || 0) + qty);
  }

  return Array.from(counts.entries()).map(([price, quantity]) => ({
    price,
    quantity,
  }));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = (Deno.env.get("STRIPE_SECRET_KEY") || "").trim();
    if (!STRIPE_SECRET_KEY) {
      return json({ error: "Missing STRIPE_SECRET_KEY" }, 500);
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });

    const body = (await req.json()) as RequestBody;

    const email = normalizeEmail(body.email);
    if (!email || !email.includes("@")) {
      return json({ error: "Invalid email" }, 400);
    }

    const cartItems = Array.isArray(body.cartItems) ? body.cartItems : [];
    if (cartItems.length === 0) {
      return json({ error: "Cart is empty" }, 400);
    }

    const successUrl =
      (body.successUrl && String(body.successUrl).trim()) ||
      "https://christmasfun.store/success";

    const cancelUrl =
      (body.cancelUrl && String(body.cancelUrl).trim()) ||
      "https://christmasfun.store/";

    const line_items = buildLineItems(cartItems);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items,
      allow_promotion_codes: true,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        source: "christmasfun.store",
        cart_json: JSON.stringify(cartItems).slice(0, 490),
      },
    });

    if (!session.url) {
      return json({ error: "Stripe session created but no url returned" }, 500);
    }

    return json({ url: session.url }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return json({ error: "Failed to create checkout session", details: message }, 400);
  }
});
