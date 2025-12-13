// supabase/functions/stripe-webhook/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
    if (req.method !== "POST") return json(405, { error: "Method not allowed" });

    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing Stripe webhook config", {
        hasStripeKey: Boolean(stripeSecretKey),
        hasWebhookSecret: Boolean(webhookSecret),
      });
      return json(500, { error: "Stripe configuration missing" });
    }

    if (!supabaseUrl || !serviceKey) {
      console.error("Missing Supabase config", {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceKey: Boolean(serviceKey),
      });
      return json(500, { error: "Supabase configuration missing" });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // IMPORTANT: raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) return json(400, { error: "Missing stripe-signature header" });

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      // Deno-friendly HTTP client
      httpClient: Stripe.createFetchHttpClient(),
    });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error("Stripe signature verification failed:", err);
      return json(400, { error: "Webhook signature verification failed" });
    }

    // We only care about completed checkout right now
    if (event.type !== "checkout.session.completed") {
      return json(200, { received: true, ignored: event.type });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Pull metadata safely (your checkout function should set these)
    const meta = session.metadata ?? {};
    const orderId = (meta.order_id || meta.orderId || "").toString().trim() || session.id;
    const productId =
      (meta.product_id || meta.productId || meta.product_type || meta.productType || "").toString().trim() || "unknown";
    const designNumberRaw = (meta.design_number || meta.designNumber || "").toString().trim();
    const designNumber = designNumberRaw ? Number(designNumberRaw) : undefined;

    const buyerEmail =
      session.customer_details?.email ||
      session.customer_email ||
      undefined;

    console.log("WEBHOOK checkout.session.completed", {
      sessionId: session.id,
      orderId,
      productId,
      designNumber,
      buyerEmail,
      amount_total: session.amount_total,
      payment_status: session.payment_status,
    });

    // Try to build download links by calling your existing Edge function (if you have it)
    // This will NOT crash the webhook if it fails; it will just log and continue.
    let downloadLinks: string[] = [];
    try {
      const resp = await fetch(`${supabaseUrl}/functions/v1/download-file`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify({
          productId,
          designNumber,
          orderId,
          sessionId: session.id,
          email: buyerEmail,
        }),
      });

      if (resp.ok) {
        const data = await resp.json().catch(() => null);
        // accept a couple common shapes
        const links =
          (Array.isArray(data?.downloadLinks) && data.downloadLinks) ||
          (Array.isArray(data?.links) && data.links) ||
          (Array.isArray(data?.urls) && data.urls) ||
          [];
        downloadLinks = links.filter((x: unknown) => typeof x === "string") as string[];
      } else {
        const t = await resp.text().catch(() => "");
        console.error("download-file failed", { status: resp.status, body: t?.slice?.(0, 500) });
      }
    } catch (e) {
      console.error("download-file threw", e);
    }

    console.log("DOWNLOAD LINK DEBUG", {
      productId,
      orderId,
      linkCount: downloadLinks.length,
      links: downloadLinks,
    });

    // Update order record if you use the orders table
    try {
      await supabase
        .from("orders")
        .update({
          status: "completed",
          download_links: downloadLinks,
          product_id: productId,
        })
        .eq("stripe_session_id", session.id);
    } catch (e) {
      console.error("orders update failed", e);
    }

    // Call your email function (send-order-email) to actually email the customer
    try {
      const productNames: Record<string, string> = {
        single_letter_99: "Single Santa Letter Design",
        single_note_99: "Single Christmas Note Design",
        notes_bundle_299: "Christmas Notes Bundle - All 4 Designs",
        all_18_bundle_999: "All 18 Designs Bundle (14 Letters + 4 Notes)",
        teacher_license_499: "Teacher License",
        coloring_bundle_free: "Free Coloring Sheets Bundle - 10 Designs",
        multi_item_cart: "Your Selected Christmas Designs",
      };

      const productName = productNames[productId] || "Christmas Design";

      const emailResp = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify({
          to: buyerEmail, // can be undefined; your email function should handle & log
          productName,
          productType: productId,
          downloadLinks,
          orderNumber: orderId,
        }),
      });

      if (!emailResp.ok) {
        const t = await emailResp.text().catch(() => "");
        console.error("send-order-email failed", { status: emailResp.status, body: t?.slice?.(0, 500) });
      } else {
        const ok = await emailResp.json().catch(() => null);
        console.log("send-order-email ok", ok);
      }
    } catch (e) {
      console.error("send-order-email threw", e);
    }

    return json(200, { received: true });
  } catch (err) {
    console.error("stripe-webhook fatal", err);
    return json(500, { error: "Webhook handler crashed" });
  }
});
