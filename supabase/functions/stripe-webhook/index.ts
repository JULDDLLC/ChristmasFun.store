/// <reference path="../_shared/deno.d.ts" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@14.21.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info, stripe-signature",
};

type ProductId =
  | "single_letter_99"
  | "single_note_99"
  | "notes_bundle_299"
  | "all_18_bundle_999"
  | "teacher_license_499"
  | "coloring_bundle_free"
  | "multi_item_cart";

const PRODUCT_NAMES: Record<string, string> = {
  single_letter_99: "Single Santa Letter Design",
  single_note_99: "Single Christmas Note Design",
  notes_bundle_299: "Christmas Notes Bundle - All 4 Designs",
  all_18_bundle_999: "All 18 Designs Bundle (14 Letters + 4 Notes)",
  teacher_license_499: "Teacher License",
  coloring_bundle_free: "Free Coloring Sheets Bundle - 10 Designs",
  multi_item_cart: "Your Selected Christmas Designs",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendOrderEmail(args: {
  buyerEmail: string;
  productId: ProductId;
  productName: string;
  downloadLinks: string[];
  orderNumber: string;
}) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

  if (!supabaseUrl || !serviceKey) {
    console.error("EMAIL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return { ok: false, error: "Missing supabase config" };
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    body: JSON.stringify({
      to: args.buyerEmail,
      productName: args.productName,
      productType: args.productId,
      downloadLinks: Array.isArray(args.downloadLinks) ? args.downloadLinks : [],
      orderNumber: args.orderNumber,
    }),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    console.error("EMAIL: send-order-email failed", { status: res.status, text });
    return { ok: false, error: text || `HTTP ${res.status}` };
  }

  console.log("EMAIL: send-order-email OK", text);
  return { ok: true };
}

async function getDownloadLinks(args: {
  productId: ProductId;
  designNumber?: number;
  orderNumber: string;
}) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

  if (!supabaseUrl || !serviceKey) {
    console.error("DL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return { ok: false, downloadLinks: [], error: "Missing supabase config" };
  }

  // IMPORTANT: this calls YOUR existing Bolt server function "download-file"
  const res = await fetch(`${supabaseUrl}/functions/v1/download-file`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    body: JSON.stringify({
      productId: args.productId,
      designNumber: args.designNumber,
      orderNumber: args.orderNumber,
    }),
  });

  const jsonData = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("DL: download-file failed", { status: res.status, jsonData });
    return { ok: false, downloadLinks: [], error: jsonData || `HTTP ${res.status}` };
  }

  const downloadLinks =
    (jsonData?.downloadLinks && Array.isArray(jsonData.downloadLinks) && jsonData.downloadLinks) ||
    (jsonData?.links && Array.isArray(jsonData.links) && jsonData.links) ||
    [];

  console.log("DOWNLOAD LINK DEBUG", {
    productId: args.productId,
    designNumber: args.designNumber,
    linkCount: downloadLinks.length,
    links: downloadLinks,
  });

  return { ok: true, downloadLinks, raw: jsonData };
}

async function updateOrderInDb(args: {
  orderId?: string;
  stripeSessionId: string;
  productId: ProductId;
  buyerEmail?: string;
  downloadLinks: string[];
}) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

  if (!supabaseUrl || !serviceKey) return;

  // If you're not using the orders table, this will just fail quietly in logs.
  const supabase = createClient(supabaseUrl, serviceKey);

  if (!args.orderId) {
    console.log("DB: No orderId in metadata; skipping orders update.");
    return;
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      stripe_session_id: args.stripeSessionId,
      customer_email: args.buyerEmail ?? null,
      product_id: args.productId,
      download_links: args.downloadLinks ?? [],
    })
    .eq("id", args.orderId);

  if (error) {
    console.error("DB: orders update failed", error);
  } else {
    console.log("DB: orders updated", { orderId: args.orderId });
  }
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
    if (req.method !== "POST") return json(405, { error: "Method not allowed" });

    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim();

    if (!stripeSecret || !webhookSecret) {
      console.error("WEBHOOK: Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
      return json(500, { error: "Stripe webhook configuration missing" });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    const sig = req.headers.get("stripe-signature");
    if (!sig) return json(400, { error: "Missing stripe-signature header" });

    const rawBody = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error("WEBHOOK: signature verification failed", err);
      return json(400, { error: "Invalid signature" });
    }

    // Always respond quickly so Stripe is happy
    // BUT we still do the work below (and log everything).
    const fastAck = json(200, { received: true });

    if (event.type !== "checkout.session.completed") {
      console.log("WEBHOOK: ignoring event type", event.type);
      return fastAck;
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Prefer metadata (this is what YOUR checkout function sets)
    const md = (session.metadata ?? {}) as Record<string, string>;

    const productId = (md.product_id || md.productId || "") as ProductId;
    const orderId = md.order_id || md.orderId || "";
    const designNumber = md.design_number ? Number(md.design_number) : undefined;

    // Buyer email
    const buyerEmail =
      session.customer_details?.email ||
      session.customer_email ||
      md.customerEmail ||
      "";

    const productName = PRODUCT_NAMES[productId] || "Christmas Designs";

    console.log("WEBHOOK: checkout.session.completed", {
      sessionId: session.id,
      orderId,
      productId,
      designNumber,
      buyerEmail,
      amountTotal: session.amount_total,
      currency: session.currency,
    });

    // If productId is missing, we cannot fulfill.
    if (!productId) {
      console.error("WEBHOOK: Missing productId in metadata. Cannot fulfill.", { md });
      return fastAck;
    }

    // 1) Generate links by calling download-file
    const dl = await getDownloadLinks({ productId, designNumber, orderNumber: orderId || session.id });

    // 2) Update DB (optional)
    await updateOrderInDb({
      orderId: orderId || undefined,
      stripeSessionId: session.id,
      productId,
      buyerEmail: buyerEmail || undefined,
      downloadLinks: dl.downloadLinks,
    });

    // 3) Send the email (even if links are empty, we log it so you see why)
    console.log("EMAIL DEBUG", {
      orderId: orderId || session.id,
      productId,
      buyerEmail,
      linkCount: dl.downloadLinks.length,
    });

    if (!buyerEmail) {
      console.error("WEBHOOK: No buyerEmail found; cannot send email.");
      return fastAck;
    }

    const emailRes = await sendOrderEmail({
      buyerEmail,
      productId,
      productName,
      downloadLinks: dl.downloadLinks,
      orderNumber: orderId || session.id,
    });

    if (!emailRes.ok) {
      console.error("WEBHOOK: sendOrderEmail failed", emailRes);
    }

    return fastAck;
  } catch (err) {
    console.error("WEBHOOK: fatal error", err);
    return json(500, { error: "Webhook handler failed" });
  }
});
