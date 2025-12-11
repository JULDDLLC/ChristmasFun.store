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
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// URL mappings for all products
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

const COLORING_SHEET_URLS = [
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

    console.info('Received Stripe event:', event.type);

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
    console.error('No stripeData on event');
    return;
  }

  // Our custom Christmas orders (have metadata.orderId)
  if (event.type === 'checkout.session.completed') {
    const session = stripeData as Stripe.Checkout.Session;

    if (session.metadata?.orderId) {
      console.info(
        'Handling Christmas checkout.session.completed with metadata:',
        session.metadata,
      );
      await handleChristmasOrder(session);
      return;
    }
  }

  // Everything else below is the more generic subscription / one-time logic
  if (!('customer' in stripeData)) {
    return;
  }

  if (event.type === 'payment_intent.succeeded' &&
      (event.data.object as any).invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData as { customer?: string };

  if (!customerId || typeof customerId !== 'string') {
    console.error(
      `No customer received on event: ${JSON.stringify(event)}`,
    );
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

        const { error: orderError } = await supabase
          .from('stripe_orders')
          .insert({
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
    const orderId = session.metadata?.orderId;
    const productId = session.metadata?.productId;
    const productType = session.metadata?.productType;

    console.info('handleChristmasOrder session metadata:', {
      orderId,
      productId,
      productType,
      items: session.metadata?.items,
      designNumber: session.metadata?.designNumber,
    });

    if (!orderId) {
      console.error('No orderId in session metadata');
      return;
    }

    let downloadLinks: string[];

    if (productType === 'multi_item_cart') {
      downloadLinks = generateMultiItemDownloadLinks(
        session.metadata?.items,
      );
    } else {
      downloadLinks = generateDownloadLinks(
        productId,
        session.metadata?.designNumber,
      );
    }

    console.info('Generated downloadLinks:', downloadLinks);

    // Try to update the DB, but DO NOT abort email if this fails
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        stripe_payment_intent: session.payment_intent as string,
        download_links: downloadLinks,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating Christmas order in DB:', updateError);
      // important: continue anyway so customer still receives the email
    } else {
      console.info('Christmas order row updated successfully in DB');
    }

    console.info(`Sending email for Christmas order: ${orderId}`);
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
      bundle_14_999: 'Complete Santa Letters Bundle - All 14 Designs',
      notes_bundle_299: 'Christmas Notes Bundle - All 4 Designs',
      complete_bundle_999: 'Complete Bundle - 14 Letters + 4 Notes',
      teacher_license_499: 'Teacher License + All Designs',
      coloring_bundle_free: 'Free Coloring Sheets Bundle - 10 Designs',
      multi_item_cart: 'Your Selected Christmas Designs',
    };

    const productName = productId
      ? productNames[productId] || 'Christmas Design'
      : 'Christmas Design';

    console.info('Calling send-order-email function with:', {
      to: session.customer_email,
      productName,
      productType: productId,
      orderId,
      downloadLinksCount: downloadLinks.length,
    });

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
          to: session.customer_email,
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

  if (productId === 'single_letter_99' && designNumber) {
    const url = SANTA_LETTER_URLS[designNumber];
    if (url) links.push(url);
  } else if (productId === 'bundle_14_999') {
    Object.values(SANTA_LETTER_URLS).forEach((url) => links.push(url));
  } else if (productId === 'notes_bundle_299') {
    Object.values(CHRISTMAS_NOTE_URLS).forEach((url) => links.push(url));
  } else if (productId === 'complete_bundle_999') {
    Object.values(SANTA_LETTER_URLS).forEach((url) => links.push(url));
    Object.values(CHRISTMAS_NOTE_URLS).forEach((url) => links.push(url));
  } else if (productId === 'teacher_license_499') {
    Object.values(SANTA_LETTER_URLS).forEach((url) => links.push(url));
  } else if (productId === 'coloring_bundle_free') {
    COLORING_SHEET_URLS.forEach((url) => links.push(url));
  }

  console.info('generateDownloadLinks result:', { productId, designNumber, links });

  return links;
}

function generateMultiItemDownloadLinks(itemsString: string | undefined): string[] {
  const links: string[] = [];

  if (!itemsString) {
    console.warn('generateMultiItemDownloadLinks called with no itemsString');
    return links;
  }

  const items = itemsString.split(',');

  for (const item of items) {
    const trimmedItem = item.trim();

    if (trimmedItem.startsWith('letter_')) {
      const letterNumber = trimmedItem.replace('letter_', '');
      const url = SANTA_LETTER_URLS[letterNumber];
      if (url) links.push(url);
    } else if (trimmedItem.startsWith('note_')) {
      const noteNumber = trimmedItem.replace('note_', '');
      const url = CHRISTMAS_NOTE_URLS[noteNumber];
      if (url) links.push(url);
    }
  }

  console.info('generateMultiItemDownloadLinks result:', { itemsString, links });

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
      console.info(
        `No active subscriptions found for customer: ${customerId}`,
      );
      const { error: noSubError } = await supabase
        .from('stripe_subscriptions')
        .upsert(
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
      return;
    }

    const subscription = subscriptions.data[0];

    const { error: subError } = await supabase
      .from('stripe_subscriptions')
      .upsert(
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
                payment_method_brand:
                  subscription.default_payment_method.card?.brand ?? null,
                payment_method_last4:
                  subscription.default_payment_method.card?.last4 ?? null,
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

    console.info(
      `Successfully synced subscription for customer: ${customerId}`,
    );
  } catch (error) {
    console.error(
      `Failed to sync subscription for customer ${customerId}:`,
      error,
    );
    throw error;
  }
}
