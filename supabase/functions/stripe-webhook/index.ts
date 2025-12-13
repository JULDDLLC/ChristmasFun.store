import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

/**
 * IMPORTANT:
 * Your files live in cPanel: /public_html/christmas-fun/*
 * So public URLs should be: https://christmasfun.store/christmas-fun/<filename>
 */
const PUBLIC_DOWNLOAD_BASE = 'https://christmasfun.store/christmas-fun';

function publicFileUrl(filename: string) {
  // encodeURI keeps slashes intact and encodes spaces as %20 etc.
  return encodeURI(`${PUBLIC_DOWNLOAD_BASE}/${filename}`);
}

/**
 * File names as they exist in your cPanel folder (based on your screenshots)
 */
const SANTA_LETTER_FILES: Record<string, string> = {
  '1': 'design1.png',
  '2': 'design2.png',
  '3': 'design3.png',
  '4': 'design4.png',
  '5': 'design5.png',
  '6': 'design6.png',
  '7': 'design7.png',
  '8': 'design8.png',
  '9': 'design9.png',
  '10': 'design10.png',
  '11': 'design11.png',
  '12': 'design12.png',
  '13': 'design13.png',
  '14': 'design14.png',
};

const CHRISTMAS_NOTE_FILES: Record<string, string> = {
  // These names include spaces in your folder — encodeURI handles it
  '1': 'Christmas Notes -blank.png',
  '2': 'Christmas Notes.png',
  '3': 'ChristmasNotes3.png',
  '4': 'ChristmasNotes3-lined.png',
};

// Your bundles in the folder
const ZIP_ALL_18 = 'all-18-designs.zip';
const ZIP_NOTES_BUNDLE = 'christmas-notes-bundle.zip';

// Teacher license file you said is present
const TEACHER_LICENSE_PDF = 'teacher-license.pdf';

// Free coloring PDF you showed in folder
const COLORING_FREE_PDF = 'coloring-free.pdf';

// Map Stripe price IDs -> internal product IDs
const PRICE_ID_TO_PRODUCT_ID: Record<string, string> = {
  // All 18 Designs Bundle - $9.99
  'price_1ScGjvBsr66TjEhQ4cRtPYm1': 'all_18_bundle_999',

  // Teacher License - $4.99
  'price_1ScH6KBsr66TjEhQAhED4Lsd': 'teacher_license_499',

  // Christmas Notes Bundle - $2.99
  'price_1ScH30Bsr66TjEhQhwLwFAME': 'notes_bundle_299',

  // Single Santa Letter - $0.99
  'price_1ScHCUBsr66TjEhQI5HBQqtU': 'single_letter_99',

  // Christmas Note (Single) - $0.99  ✅ THIS WAS WRONG BEFORE
  'price_1ScGfNBsr66TjEhQxdfKXMcn': 'single_note_99',

  // Free coloring sheets
  'price_1SctvEBsr66TjEhQ5XQ8NUxl': 'coloring_bundle_free',
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        stripeWebhookSecret,
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(
        `Webhook signature verification failed: ${error.message}`,
        { status: 400 },
      );
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = stripeData as Stripe.Checkout.Session;
    await handleChristmasOrder(session);
    return;
  }

  if (!('customer' in stripeData)) {
    return;
  }

  if (event.type === 'payment_intent.succeeded' && (event.data.object as any).invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData as Stripe.Checkout.Session;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;
      isSubscription = mode === 'subscription';
      console.info(
        `Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`,
      );
    }

    const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

    if (isSubscription) {
      console.info(`Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    } else if (mode === 'payment' && payment_status === 'paid') {
      try {
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
        } = stripeData as Stripe.Checkout.Session;

        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed',
        });

        if (orderError) {
          console.error('Error inserting order:', orderError);
          return;
        }
        console.info(
          `Successfully processed one-time payment for session: ${checkout_session_id}`,
        );
      } catch (error) {
        console.error('Error processing one-time payment:', error);
      }
    }
  }
}

async function handleChristmasOrder(session: Stripe.Checkout.Session) {
  try {
    // Use DB orderId if present, otherwise fall back to Stripe session id for the email
    const hasMetadataOrderId = Boolean(session.metadata?.orderId);
    const orderId = (session.metadata?.orderId as string) || (session.id as string);

    let productId = session.metadata?.productId as string | undefined;
    let productType = session.metadata?.productType as string | undefined;

    // If productId/productType are missing (Payment Links), infer from line items
    if (!productId || !productType) {
      const fullSession = await stripe.checkout.sessions.retrieve(session.id as string, {
        expand: ['line_items.data.price'],
      });

      const lineItems = fullSession.line_items?.data ?? [];
      const priceIds = lineItems
        .map((item) => item.price?.id)
        .filter((id): id is string => Boolean(id));

      for (const pid of priceIds) {
        if (PRICE_ID_TO_PRODUCT_ID[pid]) {
          productId = PRICE_ID_TO_PRODUCT_ID[pid];
          break;
        }
      }

      // Simple type label for now
      if (productId === 'coloring_bundle_free') {
        productType = 'coloring_bundle';
      } else if (productId === 'all_18_bundle_999') {
        productType = 'bundle';
      } else if (productId === 'teacher_license_499') {
        productType = 'teacher_license';
      } else if (productId === 'notes_bundle_299') {
        productType = 'notes_bundle';
      } else if (productId === 'single_note_99') {
        productType = 'single_note';
      } else {
        productType = productType || 'single_or_bundle';
      }
    }

    if (!productId) {
      console.error('Could not determine productId for session', session.id);
      return;
    }

    let downloadLinks: string[] = [];

    if (productType === 'multi_item_cart') {
      downloadLinks = generateMultiItemDownloadLinks(session.metadata?.items);
    } else {
      downloadLinks = generateDownloadLinks(
        productId,
        session.metadata?.designNumber,
      );
    }

    // Only try to update the orders table if there was an orderId from our app
    if (hasMetadataOrderId) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          stripe_payment_intent: session.payment_intent as string,
          download_links: downloadLinks,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating Christmas order:', updateError);
      } else {
        console.info(`Successfully processed Christmas order: ${orderId}`);
      }
    } else {
      console.info(
        `Processed payment-link Christmas order without DB row. Session: ${session.id}`,
      );
    }

    await sendOrderEmail(session, productId, downloadLinks, orderId);
  } catch (error) {
    console.error('Error handling Christmas order:', error);
  }
}

async function sendOrderEmail(
  session: Stripe.Checkout.Session,
  productId: string | undefined,
  downloadLinks: string[],
  orderId: string,
) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase configuration for email');
      return;
    }

    const productNames: Record<string, string> = {
      single_letter_99: 'Single Santa Letter Design',
      single_note_99: 'Single Christmas Note Design',
      notes_bundle_299: 'Christmas Notes Bundle - All 4 Designs',
      all_18_bundle_999: 'All 18 Designs Bundle',
      teacher_license_499: 'Teacher License + All Designs',
      coloring_bundle_free: 'Free Coloring Sheets Bundle',
      multi_item_cart: 'Your Selected Christmas Designs',
    };

    const productName = productId
      ? productNames[productId] || 'Christmas Design'
      : 'Christmas Design';

    const emailResponse = await fetch(
      `${supabaseUrl}/functions/v1/send-order-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
          apikey: supabaseServiceKey,
        },
     body: JSON.stringify({
  to: session.customer_details?.email || session.customer_email,
  productName,
  productType: productId,
  downloadLinks,
  orderNumber: orderId,
}),
      },
    );

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send order email:', errorText);
    } else {
      console.info('Order confirmation email sent successfully');
    }
  } catch (error) {
    console.error('Error sending order email:', error);
  }
}

function generateDownloadLinks(
  productId: string | undefined,
  designNumber: string | undefined,
): string[] {
  const links: string[] = [];

  // Single Santa Letter: needs designNumber (1-14)
  if (productId === 'single_letter_99') {
    if (!designNumber) return links;
    const file = SANTA_LETTER_FILES[designNumber];
    if (file) links.push(publicFileUrl(file));
    return links;
  }

  // Single Christmas Note: needs designNumber (1-4)
  if (productId === 'single_note_99') {
    if (!designNumber) return links;
    const file = CHRISTMAS_NOTE_FILES[designNumber];
    if (file) links.push(publicFileUrl(file));
    return links;
  }

  // Notes bundle: include the ZIP + individual files
  if (productId === 'notes_bundle_299') {
    links.push(publicFileUrl(ZIP_NOTES_BUNDLE));
    Object.values(CHRISTMAS_NOTE_FILES).forEach((f) => links.push(publicFileUrl(f)));
    return links;
  }

  // All 18 bundle: include the ZIP + individual files
  if (productId === 'all_18_bundle_999') {
    links.push(publicFileUrl(ZIP_ALL_18));
    Object.values(SANTA_LETTER_FILES).forEach((f) => links.push(publicFileUrl(f)));
    Object.values(CHRISTMAS_NOTE_FILES).forEach((f) => links.push(publicFileUrl(f)));
    return links;
  }

  // Teacher license: include PDF + (optional) the ZIP too (better UX)
  if (productId === 'teacher_license_499') {
    links.push(publicFileUrl(TEACHER_LICENSE_PDF));
    links.push(publicFileUrl(ZIP_ALL_18));
    return links;
  }

  // Free coloring: use your PDF (one click, done)
  if (productId === 'coloring_bundle_free') {
    links.push(publicFileUrl(COLORING_FREE_PDF));
    return links;
  }

  return links;
}

function generateMultiItemDownloadLinks(itemsString: string | undefined): string[] {
  const links: string[] = [];
  if (!itemsString) return links;

  const items = itemsString.split(',');

  for (const item of items) {
    const trimmedItem = item.trim();

    if (trimmedItem.startsWith('letter_')) {
      const letterNumber = trimmedItem.replace('letter_', '');
      const file = SANTA_LETTER_FILES[letterNumber];
      if (file) links.push(publicFileUrl(file));
    } else if (trimmedItem.startsWith('note_')) {
      const noteNumber = trimmedItem.replace('note_', '');
      const file = CHRISTMAS_NOTE_FILES[noteNumber];
      if (file) links.push(publicFileUrl(file));
    }
  }

  return links;
}

async function syncCustomerFromStripe(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
    }

    const subscription = subscriptions.data[0];

    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method &&
        typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ??
                null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ??
                null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}
