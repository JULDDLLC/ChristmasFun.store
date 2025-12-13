import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = (Deno.env.get('STRIPE_SECRET_KEY') || '').trim();
const stripeWebhookSecret = (Deno.env.get('STRIPE_WEBHOOK_SECRET') || '').trim();

const supabaseUrl = (Deno.env.get('SUPABASE_URL') || '').trim();
const serviceKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();

if (!stripeSecret) console.error('Missing STRIPE_SECRET_KEY');
if (!stripeWebhookSecret) console.error('Missing STRIPE_WEBHOOK_SECRET');
if (!supabaseUrl) console.error('Missing SUPABASE_URL');
if (!serviceKey) console.error('Missing SUPABASE_SERVICE_ROLE_KEY');

const stripe = new Stripe(stripeSecret, {
  appInfo: { name: 'ChristmasFun.store', version: '1.0.0' },
});

const supabase = createClient(supabaseUrl, serviceKey);

// Your Stripe Price IDs -> your internal product IDs
const PRICE_ID_TO_PRODUCT_ID: Record<string, string> = {
  // All 18 Designs Bundle - $9.99
  price_1ScGjvBsr66TjEhQ4cRtPYm1: 'all_18_bundle_999',

  // Teacher License - $4.99
  price_1ScH6KBsr66TjEhQAhED4Lsd: 'teacher_license_499',

  // Christmas Notes Bundle (4) - $2.99
  price_1ScH30Bsr66TjEhQhwLwFAME: 'notes_bundle_299',

  // Santa Letter (Single) - $0.99
  price_1ScHCUBsr66TjEhQI5HBQqtU: 'single_letter_99',

  // Christmas Note (Single) - $0.99
  price_1ScGfNBsr66TjEhQxdfKXMcn: 'single_note_99',

  // Free Coloring Sheets
  price_1SctvEBsr66TjEhQ5XQ8NUxl: 'coloring_bundle_free',
};

// These are the “links” your email will contain.
// IMPORTANT: I’m leaving these as your current CDN links because that’s what your project currently has.
// Next step (after this file works) is we swap these to your own juldd.tsiprogram.org links and/or to a download endpoint.
const SANTA_LETTER_URLS: Record<string, string> = {
  '1': 'https://cdn1.site-media.eu/images/0/21587768/design1-Z3wu6c1nLAh3ACrbe46Gmg.png',
  '2': 'https://cdn1.site-media.eu/images/0/21587759/design2-Xs-oos-r7fL_Gn4-yusolg.png',
  '3': 'https://cdn1.site-media.eu/images/0/21587758/design3-rpLHL3OeUCdrIqzMr7wNYA.png',
  '4': 'https://cdn1.site-media.eu/images/0/21587450/DearSanta2-EyDV0P1Wf8rh1mYm0lQwew.png',
  '5': 'https://cdn1.site-media.eu/images/0/21587438/DearSantaLetter-X4mrLdblVYGmVh_xVEIdhg.png',
  '6': 'https://cdn1.site-media.eu/images/0/21587392/DearSantaLetter4-_CjR-X24vAzawUhHvsEB7A.png',
  '7': 'https://cdn1.site-media.eu/images/0/21587432/DearSantaLetter1-Gr0SVAqpn4KVS5U8qkGlfQ.png',
  '8': 'https://cdn1.site-media.eu/images/0/21587416/DearSantaLetter2-3iGVMx_c3Va-NcPSt486AA.png',
  '9': 'https://cdn1.site-media.eu/images/0/21587763/design9-be-BNu7ELngHsB4-prRBsw.png',
  '10': 'https://cdn1.site-media.eu/images/0/21587361/DearSantaLetter8-7XA4wULg3muTEB7z7NkmXg.png',
  '11': 'https://cdn1.site-media.eu/images/0/21587888/design11-y92iFyQtYnasvWXozYAjTg.png',
  '12': 'https://cdn1.site-media.eu/images/0/21587761/design12-mVBhwMJJ1BEl0y8ocesZlQ.png',
  '13': 'https://cdn1.site-media.eu/images/0/21587399/DearSantaLetter3-PmrmOxSHQkpwG_jKh2M2vQ.png',
  '14': 'https://cdn1.site-media.eu/images/0/21587399/DearSantaLetter3-PmrmOxSHQkpwG_jKh2M2vQ.png',
};

const CHRISTMAS_NOTE_URLS: Record<string, string> = {
  '1': 'https://cdn1.site-media.eu/images/0/21587542/ChristmasNotes-blank-FeUDnrdQLKzZkZEYLgmt-A.png',
  '2': 'https://cdn1.site-media.eu/images/0/21587536/ChristmasNotes-RFAy0MOttbNqrOGEc3EkCg.png',
  '3': 'https://cdn1.site-media.eu/images/0/21587575/ChristmasNotes3-KfzspG5RqPBYZ-u3jxt5tQ.png',
  '4': 'https://cdn1.site-media.eu/images/0/21587693/ChristmasNotes3-lined-J0xhPIRuUzj56rqkQCSn0A.png',
};

const COLORING_SHEET_URLS: string[] = [
  'https://cdn1.site-media.eu/images/0/21587509/coloringsheet2-f9nybkb9Ilb3N2Tjv0ChRw.jpg',
  'https://cdn1.site-media.eu/images/0/21587515/coloringsheet5-K_VmLl_kgh-1P-4C0WD-tA.jpg',
  'https://cdn1.site-media.eu/images/0/21587506/coloringsheet6-QccnrzfbkCEPUmckBjmE9A.jpg',
  'https://cdn1.site-media.eu/images/0/21587530/coloringsheet10-c9V0SulK6cYd1YRMhljGEQ.jpg',
  'https://cdn1.site-media.eu/images/0/21587501/coloringsheet12-WBA6Fy9wbtojx_ncIim57Q.jpg',
  'https://cdn1.site-media.eu/images/0/21587522/coloringsheet-IntricateMandalaChristmasWreath-N0MesPRJvpIQqMoOqSjpLA.jpg',
  'https://cdn1.site-media.eu/images/0/21587521/coloringsheet-OrnamentalChristmasTreeWithFiligreePatterns-iK1VBjuqWCToeWeFUV82TQ.jpg',
  'https://cdn1.site-media.eu/images/0/21587716/coloringsheet-VictorianChristmasStreetScene-uFxaHo7iSJBtVTTmNiphMQ.jpg',
  'https://cdn1.site-media.eu/images/0/21587507/coloringpages-SantasWorkshopHyper-DetailedLineArt-HXMJtPgkf0CVY6dm6DZDdw.jpg',
  'https://cdn1.site-media.eu/images/0/21587494/coloringpages-GingerbreadCityscape-Sikuj3H5mHfruzhOqXPrOg.jpg',
];

function generateDownloadLinks(productId: string, designNumber?: string): string[] {
  const links: string[] = [];

  if (productId === 'single_letter_99') {
    if (designNumber && SANTA_LETTER_URLS[designNumber]) links.push(SANTA_LETTER_URLS[designNumber]);
    return links;
  }

  if (productId === 'single_note_99') {
    if (designNumber && CHRISTMAS_NOTE_URLS[designNumber]) links.push(CHRISTMAS_NOTE_URLS[designNumber]);
    return links;
  }

  if (productId === 'notes_bundle_299') {
    Object.values(CHRISTMAS_NOTE_URLS).forEach((u) => links.push(u));
    return links;
  }

  if (productId === 'all_18_bundle_999') {
    Object.values(SANTA_LETTER_URLS).forEach((u) => links.push(u));
    Object.values(CHRISTMAS_NOTE_URLS).forEach((u) => links.push(u));
    return links;
  }

  if (productId === 'teacher_license_499') {
    // If you want teacher-license.pdf in the email, we’ll wire this to your real hosted PDF in the NEXT step.
    // For now we send all letter designs so your buyers at least get something.
    Object.values(SANTA_LETTER_URLS).forEach((u) => links.push(u));
    return links;
  }

  if (productId === 'coloring_bundle_free') {
    COLORING_SHEET_URLS.forEach((u) => links.push(u));
    return links;
  }

  return links;
}

async function sendOrderEmail(session: Stripe.Checkout.Session, productId: string, downloadLinks: string[], orderId: string) {
  try {
    const invokeUrl = (Deno.env.get('SUPABASE_URL') || '').trim();
    const service = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();
    const anon = (Deno.env.get('SUPABASE_ANON_KEY') || '').trim();
    const authKey = service || anon;

    if (!invokeUrl || !authKey) {
      console.error('Missing Supabase configuration for email invoke', {
        hasSupabaseUrl: Boolean(invokeUrl),
        hasServiceKey: Boolean(service),
        hasAnonKey: Boolean(anon),
      });
      return;
    }

    const fullSession = await stripe.checkout.sessions.retrieve(session.id as string, {
      expand: ['customer_details'],
    });

    const buyerEmail =
      fullSession.customer_details?.email ||
      (fullSession.customer_email as string | null) ||
      (session.customer_details?.email as string | null) ||
      (session.customer_email as string | null);

    console.log('EMAIL DEBUG', {
      orderId,
      productId,
      buyerEmail,
      linkCount: Array.isArray(downloadLinks) ? downloadLinks.length : 0,
    });

    if (!buyerEmail) {
      console.error('No buyer email found on session. Cannot send download email.', { sessionId: session.id });
      return;
    }

    const productNames: Record<string, string> = {
      single_letter_99: 'Single Santa Letter Design',
      single_note_99: 'Single Christmas Note Design',
      notes_bundle_299: 'Christmas Notes Bundle - All 4 Designs',
      all_18_bundle_999: 'All 18 Designs Bundle (14 Letters + 4 Notes)',
      teacher_license_499: 'Teacher License',
      coloring_bundle_free: 'Free Coloring Sheets Bundle - 10 Designs',
      multi_item_cart: 'Your Selected Christmas Designs',
    };

    const productName = productNames[productId] || 'Christmas Design';

    const emailResponse = await fetch(`${invokeUrl}/functions/v1/send-order-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authKey}`,
        apikey: authKey,
      },
      body: JSON.stringify({
        to: buyerEmail,
        productName,
        productType: productId,
        downloadLinks: Array.isArray(downloadLinks) ? downloadLinks : [],
        orderNumber: orderId,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send order email:', errorText);
      return;
    }

    const okJson = await emailResponse.json().catch(() => null);
    console.log('send-order-email response ok', okJson);
  } catch (error) {
    console.error('Error sending order email:', error);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });

  console.log('🔥 STRIPE WEBHOOK HIT', {
    method: req.method,
    url: req.url,
    hasSignature: Boolean(req.headers.get('stripe-signature')),
  });

  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('No signature found', { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed', err?.message || err);
    return new Response(`Webhook signature verification failed: ${err?.message || 'unknown error'}`, { status: 400 });
  }

  console.log('✅ STRIPE EVENT VERIFIED', { type: event.type, id: event.id });

  try {
    if (event.type !== 'checkout.session.completed') {
      return Response.json({ received: true, ignored: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Accept multiple metadata key styles from different versions
    const md = (session.metadata || {}) as Record<string, string | undefined>;

    const orderId = (md.orderId || md.order_id || session.id || '').toString();
    const designNumber = (md.designNumber || md.design_number || '').toString() || undefined;

    // Product id could be explicitly set, otherwise infer from line item price id
    let productId = (md.productId || md.product_id || md.productType || md.product_type || '').toString() || undefined;

    if (!productId) {
      const full = await stripe.checkout.sessions.retrieve(session.id as string, {
        expand: ['line_items.data.price'],
      });

      const priceId = full.line_items?.data?.[0]?.price?.id;
      if (priceId && PRICE_ID_TO_PRODUCT_ID[priceId]) {
        productId = PRICE_ID_TO_PRODUCT_ID[priceId];
      }
    }

    if (!productId) {
      console.error('Could not determine productId for session', { sessionId: session.id, metadata: md });
      return Response.json({ received: true, error: 'missing_productId' });
    }

    const downloadLinks = generateDownloadLinks(productId, designNumber);

    console.log('DOWNLOAD LINK DEBUG', {
      orderId,
      productId,
      designNumber,
      linkCount: downloadLinks.length,
    });

    // Best effort: update your orders table if the row exists
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          stripe_payment_intent: session.payment_intent as string,
          download_links: downloadLinks,
        })
        .eq('stripe_session_id', session.id);

      if (updateError) {
        console.error('Order update warning (not fatal):', updateError);
      }
    } catch (e) {
      console.error('Order update exception (not fatal):', e);
    }

    await sendOrderEmail(session, productId, downloadLinks, orderId);

    return Response.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return Response.json({ received: true, error: 'handler_failed' }, { status: 200 });
  }
});
