// supabase/functions/stripe-webhook/index.ts
// Fixes:
// - Uses constructEventAsync (required for Supabase Edge + Deno crypto)
// - Accepts BOTH snake_case and camelCase metadata keys
// - Logs metadata + link generation so you can see exactly what's happening
// - Calls send-order-email with a consistent payload

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim();

const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim();

const supabaseAuthKey = serviceKey || anonKey;

if (!stripeSecretKey) console.error("Missing STRIPE_SECRET_KEY");
if (!webhookSecret) console.error("Missing STRIPE_WEBHOOK_SECRET");
if (!supabaseUrl) console.error("Missing SUPABASE_URL");
if (!supabaseAuthKey) console.error("Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY");

const stripe = new Stripe(stripeSecretKey || "", {
  apiVersion: "2024-09-30.acacia",
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getMeta(session: Stripe.Checkout.Session) {
  // Stripe types metadata as possibly null
  const md = (session.metadata || {}) as Record<string, string>;

  // Accept BOTH formats
  const productId =
    md.product_id ||
    md.productId ||
    md.productID ||
    md.product ||
    "";

  const orderId =
    md.order_id ||
    md.orderId ||
    md.orderID ||
    md.order ||
    "";

  // Optional multi-product support (comma separated)
  const productIdsRaw =
    md.product_ids ||
    md.productIds ||
    md.products ||
    "";

  // design info (optional)
  const productType =
    md.product_type ||
    md.productType ||
    "";

  const designNumber =
    md.design_number ||
    md.designNumber ||
    "";

  return {
    md,
    productId,
    orderId,
    productIdsRaw,
    productType,
    designNumber,
  };
}

function normalizeProductIds(singleProductId: string, productIdsRaw: string) {
  // If productIdsRaw exists, prefer it; else fall back to singleProductId
  const list = (productIdsRaw || singleProductId || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  // Deduplicate
  return Array.from(new Set(list));
}

async function invokeEdgeFunction(path: string, payload: unknown) {
  if (!supabaseUrl || !supabaseAuthKey) {
    throw new Error("Missing Supabase URL/auth key for function invoke");
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAuthKey}`,
      apikey: supabaseAuthKey,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  return { ok: res.ok, status: res.status, text, data };
}

async function generateDownloadLinks(productIds: string[], orderId: string) {
  // If you already have a function to generate links (you DO: "download-file"),
  // use it. We'll call it once per productId and accept multiple return shapes.

  const allLinks: string[] = [];

  for (const pid of productIds) {
    try {
      const resp = await invokeEdgeFunction("download-file", {
        productId: pid,
        orderId,
      });

      if (!resp.ok) {
        console.error("download-file failed", { pid, orderId, status: resp.status, body: resp.text });
        continue;
      }

      const d = resp.data;

      // Accept common shapes:
      // { url: "..." }
      // { link: "..." }
      // { links: ["..."] }
      // { downloadLinks: ["..."] }
      // { urls: ["..."] }
      if (typeof d?.url === "string") allLinks.push(d.url);
      if (typeof d?.link === "string") allLinks.push(d.link);

      if (Array.isArray(d?.links)) allLinks.push(...d.links);
      if (Array.isArray(d?.downloadLinks)) allLinks.push(...d.downloadLinks);
      if (Array.isArray(d?.urls)) allLinks.push(...d.urls);

    } catch (e) {
      console.error("download-file exception", { pid, orderId, error: String(e) });
    }
  }

  // Deduplicate
  return Array.from(new Set(allLinks)).filter(Boolean);
}

function productNameFromId(productId: string) {
  const names: Record<string, string> = {
    single_letter_99: "Single Santa Letter Design",
    single_note_99: "Single Christmas Note Design",
    notes_bundle_299: "Christmas Notes Bundle - All 4 Designs",
    all_18_bundle_999: "All 18 Designs Bundle (14 Letters + 4 Notes)",
    teacher_license_499: "Teacher License",
    coloring_bundle_free: "Free Coloring Sheets Bundle - 10 Designs",
    multi_item_cart: "Your Selected Christmas Designs",
  };

  return names[productId] || "Christmas Design";
}

async function sendOrderEmail(
  session: Stripe.Checkout.Session,
  productId: string,
  downloadLinks: string[],
  orderId: string,
) {
  // Force-retrieve session to reliably get customer_details.email if needed
  const fullSession = await stripe.checkout.sessions.retrieve(session.id as string, {
    expand: ["customer_details"],
  });

  const buyerEmail =
    fullSession.customer_details?.email ||
    (fullSession.customer_email as string | null) ||
    (session.customer_details?.email as string | null) ||
    (session.customer_email as string | null) ||
    "";

  console.log("EMAIL DEBUG", {
    orderId,
    productId,
    buyerEmail,
    linkCount: Array.isArray(downloadLinks) ? downloadLinks.length : 0,
  });

  if (!buyerEmail) {
    console.error("No buyer email found on session. Cannot send download email.", {
      sessionId: session.id,
    });
    return;
  }

  const payload = {
    to: buyerEmail,
    productName: productNameFromId(productId),
    productType: productId || "unknown",
    downloadLinks: Array.isArray(downloadLinks) ? downloadLinks : [],
    orderNumber: orderId || (session.id as string),
  };

  const emailResp = await invokeEdgeFunction("send-order-email", payload);

  if (!emailResp.ok) {
    console.error("Email send failed", {
      status: emailResp.status,
      body: emailResp.text,
      payloadSent: payload,
    });
    return;
  }

  console.log("send-order-email OK", emailResp.data);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    if (!webhookSecret) return json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, 500);

    const sig = req.headers.get("stripe-signature");
    if (!sig) return json({ error: "Missing stripe-signature header" }, 400);

    // IMPORTANT: use raw bytes, not req.text()
    const rawBody = new Uint8Array(await req.arrayBuffer());

    // ✅ FIX: constructEventAsync (required in this environment)
    const event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);

    if (event.type !== "checkout.session.completed") {
      // Acknowledge other events
      return json({ received: true, ignored: event.type });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    const { md, productId, orderId, productIdsRaw } = getMeta(session);

    console.log("WEBHOOK METADATA DEBUG", {
      eventType: event.type,
      sessionId: session.id,
      metadata: md,
      productId,
      orderId,
      productIdsRaw,
    });

    const productIds = normalizeProductIds(productId, productIdsRaw);

    // If orderId missing, we still proceed but use session.id as fallback
    const effectiveOrderId = orderId || (session.id as string);

    // Generate links
    const downloadLinks = await generateDownloadLinks(productIds, effectiveOrderId);

    console.log("DOWNLOAD LINK DEBUG", {
      productIds,
      orderId: effectiveOrderId,
      linkCount: downloadLinks.length,
      links: downloadLinks,
    });

    // Pick a primary product for naming (first in list)
    const primaryProductId = productIds[0] || productId || "unknown";

    await sendOrderEmail(session, primaryProductId, downloadLinks, effectiveOrderId);

    return json({ received: true });
  } catch (err) {
    console.error("stripe-webhook error", String(err));
    return json({ error: String(err) }, 400);
  }
});
