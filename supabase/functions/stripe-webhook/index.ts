/// <reference types="npm:@types/node" />

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";

const STRIPE_SECRET_KEY = (Deno.env.get("STRIPE_SECRET_KEY") || "").trim();
const STRIPE_WEBHOOK_SECRET = (Deno.env.get("STRIPE_WEBHOOK_SECRET") || "").trim();

// These must exist for calling your other edge functions (send-order-email)
const SUPABASE_URL = (Deno.env.get("SUPABASE_URL") || "").trim();
const SUPABASE_SERVICE_ROLE_KEY = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "").trim();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function okText(msg = "ok") {
  return new Response(msg, { status: 200 });
}

// This mapping is only used as a last-resort fallback if metadata is missing.
// Your system SHOULD include metadata, but we cannot rely on that right now.
const PRICE_ID_TO_PRODUCT = new Map<string, { product_id: string; label: string }>([
  ["price_1ScHCUBsr66TjEhQI5HBQqtU", { product_id: "santa_letter_single", label: "Santa Letter (Single)" }],
  ["price_1ScGfNBsr66TjEhQxdfKXMcn", { product_id: "christmas_note_single", label: "Christmas Note (Single)" }],
  ["price_1ScH30Bsr66TjEhQhwLwFAME", { product_id: "christmas_notes_bundle", label: "Christmas Notes Bundle" }],
  ["price_1ScGjvBsr66TjEhQ4cRtPYm1", { product_id: "all_18_bundle", label: "All 18 Designs Bundle" }],
  ["price_1ScH6KBsr66TjEhQAhED4Lsd", { product_id: "teacher_license", label: "Teacher License" }],
  ["price_1SctvEBsr66TjEhQ5XQ8NUxl", { product_id: "free_coloring", label: "Free Coloring Sheets" }],
]);

function pickMeta(md: Record<string, any> | null | undefined, key1: string, key2: string) {
  if (!md) return undefined;
  return md[key1] ?? md[key2];
}

async function callEdgeFunction(functionName: string, payload: unknown) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY, cannot call:", functionName);
    return { ok: false, status: 500, body: { error: "Missing supabase env for function call" } };
  }

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      // Service role lets your internal functions work without CORS/auth headaches.
      "authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text().catch(() => "");
  let body: any = text;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    // keep raw text
  }

  return { ok: res.ok, status: res.status, body };
}

Deno.serve(async (req) => {
  // Stripe sends POST. Some health checks might hit GET.
  if (req.method !== "POST") return okText("ok");

  if (!STRIPE_SECRET_KEY) {
    console.error("Missing STRIPE_SECRET_KEY");
    // Return 200 so Stripe does not hammer retries endlessly
    return okText("missing stripe secret key");
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const sig = req.headers.get("stripe-signature") || "";

  // IMPORTANT: raw body for signature verification
  const rawBody = await req.text();

  let event: Stripe.Event | null = null;

  try {
    if (STRIPE_WEBHOOK_SECRET) {
      // Supabase Edge requires async verification
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      // If secret is not set, accept event for now to stop retries.
      // You should set STRIPE_WEBHOOK_SECRET as soon as possible.
      console.warn("STRIPE_WEBHOOK_SECRET not set. Accepting webhook without verification.");
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err?.message || err);
    // Return 200 to stop infinite retries while you fix secrets.
    // This prevents the “pending webhook” pile-up and duplicate emails.
    return okText("signature verification failed (returned 200 to stop retries)");
  }

  if (!event) return okText("no event");

  // Only handle the event you care about
  if (event.type !== "checkout.session.completed") {
    return okText("ignored");
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;

    const md = (session.metadata || {}) as Record<string, any>;
    const sessionId = session.id;

    // Accept both snake_case and camelCase
    const order_id = pickMeta(md, "order_id", "orderId") ?? "";
    const product_id = pickMeta(md, "product_id", "productId") ?? "";
    const product_type = pickMeta(md, "product_type", "productType") ?? "";
    const design_number = pickMeta(md, "design_number", "designNumber") ?? "";

    const customerEmail =
      session.customer_details?.email ||
      (session.customer_email ?? "") ||
      "";

    console.log("WEBHOOK checkout.session.completed", {
      event_id: event.id,
      session_id: sessionId,
      customerEmail,
      metadata: md,
      extracted: { order_id, product_id, product_type, design_number },
    });

    // Pull line items so we can infer products even when metadata is missing
    let inferredProducts: Array<{ product_id: string; label: string; price_id: string }> = [];

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });
      for (const li of lineItems.data) {
        const priceId = (li.price?.id || "").trim();
        if (!priceId) continue;

        const mapped = PRICE_ID_TO_PRODUCT.get(priceId);
        if (mapped) {
          inferredProducts.push({ product_id: mapped.product_id, label: mapped.label, price_id: priceId });
        } else {
          inferredProducts.push({ product_id: "unknown", label: li.description || "Unknown item", price_id: priceId });
        }
      }
    } catch (e) {
      console.error("Failed to list line items:", e?.message || e);
    }

    // Decide what to send to send-order-email.
    // Your send-order-email complained “Missing required fields”, so we send a wide payload.
    const payload = {
      // Always include email if we have it
      email: customerEmail,
      customerEmail,

      // Order identifiers
      order_id: order_id || md.order_id || "",
      orderId: order_id || md.orderId || "",
      stripe_session_id: sessionId,
      session_id: sessionId,

      // Product identifiers
      product_id: product_id || md.product_id || "",
      productId: product_id || md.productId || "",
      product_type: product_type || md.product_type || "",
      productType: product_type || md.productType || "",
      design_number: design_number || md.design_number || "",
      designNumber: design_number || md.designNumber || "",

      // Inferred products from line items (helps multi-cart and missing metadata)
      inferredProducts,

      // Raw metadata for debugging
      metadata: md,

      // Stripe context
      stripe: {
        event_id: event.id,
        session_id: sessionId,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
      },
    };

    if (!customerEmail) {
      console.error("No customer email on session. Cannot send email.", { sessionId, md });
      // Return 200 so Stripe does not retry forever.
      return okText("no email (accepted)");
    }

    const sendRes = await callEdgeFunction("send-order-email", payload);

    if (!sendRes.ok) {
      console.error("send-order-email failed", { status: sendRes.status, body: sendRes.body });
      // Still return 200 so Stripe does not retry and spam emails
      return okText("send-order-email failed (accepted)");
    }

    console.log("send-order-email success", sendRes.body);
    return okText("ok");
  } catch (err) {
    console.error("Webhook handler error:", err?.message || err);
    // Return 200 to prevent Stripe retry storms and duplicate emails
    return okText("handler error (accepted)");
  }
});
