// supabase/functions/christmas-multi-checkout/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CartItem = {
  type?: string;
  quantity?: number;

  // your frontend sometimes sends these:
  priceId?: string;
  price_id?: string;

  // misc fields that may exist
  designNumber?: number;
  noteNumber?: number;
  name?: string;
  price?: number;
  priceCents?: number;
};

type RequestBody = {
  items: CartItem[];
  customerEmail?: string;
};

const FALLBACK_ORIGIN = "https://christmasfun.store";
const FALLBACK_SUPABASE_URL = "https://kvnbgubooykiveogifwt.supabase.co";

// Stripe Price IDs (from Julie)
const PRICE_IDS = {
  santa_letter_single: "price_1ScHCUBsr66TjEhQI5HBQqtU", // $0.99
  christmas_note_single: "price_1ScGfNBsr66TjEhQxdfKXMcn", // $0.99
  christmas_notes_bundle: "price_1ScH30Bsr66TjEhQhwLwFAME", // $2.99
  all_18_bundle: "price_1ScGjvBsr66TjEhQ4cRtPYm1", // (assume $9.99 based on your bundle flow)
  teacher_license: "price_1ScH6KBsr66TjEhQAhED4Lsd", // $4.99
  free_coloring: "price_1SctvEBsr66TjEhQ5XQ8NUxl", // free
} as const;

// cents map so we can store amount in orders.amount (your schema uses "amount", not "amount_cents")
const PRICE_ID_TO_CENTS: Record<string, number> = {
  [PRICE_IDS.santa_letter_single]: 99,
  [PRICE_IDS.christmas_note_single]: 99,
  [PRICE_IDS.christmas_notes_bundle]: 299,
  [PRICE_IDS.teacher_license]: 499,
  [PRICE_IDS.all_18_bundle]: 999, // if your all-bundle is NOT $9.99, change this number
  [PRICE_IDS.free_coloring]: 0,
};

function normalizeType(t?: string) {
  return (t || "").toLowerCase().trim();
}

function resolvePriceId(item: CartItem): string | null {
  // If frontend ever sends it, prefer that:
  const direct = (item.priceId || item.price_id || "").trim();
  if (direct) return direct;

  const t = normalizeType(item.type);

  // Common variants seen in your code/history:
  if (
    t === "santa_letter" ||
    t === "single_letter" ||
    t === "letter" ||
    t === "santa-letter" ||
    t === "santa_letter_single"
  ) {
    return PRICE_IDS.santa_letter_single;
  }

  if (
    t === "christmas_note" ||
    t === "single_note" ||
    t === "note" ||
    t === "christmas-note" ||
    t === "christmas_note_single"
  ) {
    return PRICE_IDS.christmas_note_single;
  }

  if (
    t === "notes_bundle" ||
    t === "christmas_notes_bundle" ||
    t === "bundle_notes" ||
    t === "notes-bundle"
  ) {
    return PRICE_IDS.christmas_notes_bundle;
  }

  if (
    t === "complete_bundle" ||
    t === "all_18_bundle" ||
    t === "all_designs_bundle" ||
    t === "bundle_all" ||
    t === "complete-bundle"
  ) {
    return PRICE_IDS.all_18_bundle;
  }

  if (
    t === "teacher_license" ||
    t === "teacher" ||
    t === "license" ||
    t === "teacher-license"
  ) {
    return PRICE_IDS.teacher_license;
  }

  if (
    t === "free_coloring" ||
    t === "coloring" ||
    t === "freebie" ||
    t === "free_coloring_sheets"
  ) {
    return PRICE_IDS.free_coloring;
  }

  return null;
}

function getOrigin(req: Request): string {
  const url = new URL(req.url);
  // If your function is called directly, req.url origin is the function domain.
  // Better: use request Origin header if present.
  const originHeader = req.headers.get("origin");
  if (originHeader && originHeader.startsWith("http")) return originHeader;
  // fallback to your production site
  return FALLBACK_ORIGIN || `${url.protocol}//${url.host}`;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ---- ENV ----
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")?.trim() || "";
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")?.trim() || FALLBACK_SUPABASE_URL;

    // Prefer service role key for inserts into orders
    const SUPABASE_SERVICE_ROLE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ||
      Deno.env.get("SUPABASE_SERVICE_KEY")?.trim() ||
      "";

    // As a last resort, allow anon key (ONLY works if your RLS allows it)
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";

    if (!STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing STRIPE_SECRET_KEY in function environment variables",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseKeyToUse = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

    if (!supabaseKeyToUse) {
      return new Response(
        JSON.stringify({
          error: "Missing Supabase keys in function environment variables",
          details:
            "Set SUPABASE_SERVICE_ROLE_KEY (recommended). Anon key only works if orders table RLS allows inserts.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, supabaseKeyToUse);
    const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-09-30.acacia" });

    // ---- BODY ----
    const body = (await req.json()) as RequestBody;
    const items = Array.isArray(body.items) ? body.items : [];
    const customerEmail = (body.customerEmail || "").trim();

    if (!items.length) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate + map items to Stripe line_items
    const line_items: { price: string; quantity: number }[] = [];
    const resolvedForDebug: Array<{ receivedKeys: string[]; resolvedPriceId: string | null }> =
      [];

    let totalAmountCents = 0;

    for (const item of items) {
      const priceId = resolvePriceId(item);
      const qty = Number(item.quantity || 1) || 1;

      resolvedForDebug.push({
        receivedKeys: Object.keys(item || {}),
        resolvedPriceId: priceId,
      });

      if (!priceId) {
        return new Response(
          JSON.stringify({
            error: "Invalid item",
            details:
              "Item missing priceId and unit amount. Your cart items must include a Stripe price id (priceId/price_id) OR a recognized type that can be mapped.",
            receivedItem: item,
            receivedKeys: Object.keys(item || {}),
            exampleExpected: { priceId: "price_123", quantity: 1 },
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      line_items.push({ price: priceId, quantity: qty });

      const centsEach = PRICE_ID_TO_CENTS[priceId];
      if (typeof centsEach === "number") {
        totalAmountCents += centsEach * qty;
      }
    }

    // ---- CREATE ORDER (Supabase) ----
    // IMPORTANT: your table uses "amount" (not "amount_cents")
    // Keep this insert minimal so it matches your schema.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: customerEmail || null,
        status: "pending",
        amount: totalAmountCents, // cents
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({
          error: "Failed to create order",
          details: orderError?.message || "Unknown order insert error",
          hint:
            "If this is an RLS error, you must use SUPABASE_SERVICE_ROLE_KEY in the function env vars or adjust RLS policies.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const origin = getOrigin(req);

    // ---- CREATE STRIPE CHECKOUT SESSION ----
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      line_items,
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#cart-cancelled`,
      customer_email: customerEmail || undefined,
      metadata: {
        order_id: String(order.id),
        customer_email: customerEmail || "",
        // helpful for debugging if needed:
        line_items_count: String(line_items.length),
      },
    });

    if (!session?.url) {
      return new Response(
        JSON.stringify({
          error: "Failed to create checkout session",
          details: "Stripe session created without a URL",
          debug: { resolvedForDebug },
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        url: session.url,
        order_id: order.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error in christmas-multi-checkout:", err);
    return new Response(
      JSON.stringify({ error: "Checkout failed", details: String((err as any)?.message || err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
