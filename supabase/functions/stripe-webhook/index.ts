import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-09-30.acacia',
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing Stripe signature', { status: 400 });
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    return new Response('Missing webhook secret', { status: 500 });
  }

  const body = await req.text();

  let event: Stripe.Event;

  try {
    // IMPORTANT: Supabase Edge + Deno requires the async verifier
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  const productId =
    session.metadata?.product_id ||
    session.metadata?.productId ||
    session.metadata?.product_type ||
    'unknown';

  const orderId = session.id;

  // --------------------------------------------------
  // DOWNLOAD LINKS (YOUR PRODUCTS)
  // --------------------------------------------------

  const BASE_URL = 'https://christmasfun.store/downloads';

  const downloadMap: Record<string, string[]> = {
    single_letter_99: [
      `${BASE_URL}/letters/santa-letter.png`,
    ],

    single_note_99: [
      `${BASE_URL}/notes/christmas-note.png`,
    ],

    notes_bundle_299: [
      `${BASE_URL}/notes/note-1.png`,
      `${BASE_URL}/notes/note-2.png`,
      `${BASE_URL}/notes/note-3.png`,
      `${BASE_URL}/notes/note-4.png`,
    ],

    all_18_bundle_999: [
      ...Array.from({ length: 14 }).map((_, i) => `${BASE_URL}/letters/santa-letter-${i + 1}.png`),
      `${BASE_URL}/notes/note-1.png`,
      `${BASE_URL}/notes/note-2.png`,
      `${BASE_URL}/notes/note-3.png`,
      `${BASE_URL}/notes/note-4.png`,
    ],

    teacher_license_499: [
      `${BASE_URL}/teacher/teacher-license.pdf`,
    ],

    coloring_bundle_free: [
      ...Array.from({ length: 10 }).map((_, i) => `${BASE_URL}/coloring/coloring-${i + 1}.pdf`),
    ],
  };

  const downloadLinks = downloadMap[productId] ?? [];

  console.log('DOWNLOAD LINK DEBUG', {
    productId,
    linkCount: downloadLinks.length,
    links: downloadLinks,
  });

  // --------------------------------------------------
  // SEND EMAIL
  // --------------------------------------------------

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase config for email');
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  const to =
    session.customer_details?.email ||
    session.customer_email ||
    null;

  const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    body: JSON.stringify({
      to,
      productType: productId,
      downloadLinks,
      orderNumber: orderId,
    }),
  });

  if (!emailRes.ok) {
    const errText = await emailRes.text();
    console.error('Email send failed', errText);
  } else {
    console.log('Order email sent successfully');
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
