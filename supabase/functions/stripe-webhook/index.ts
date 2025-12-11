// supabase/functions/stripe-webhook/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

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
        stripeWebhookSecret
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(
        `Webhook signature verification failed: ${error.message}`,
        { status: 400 }
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

  // Christmas orders go here
  if (event.type === 'checkout.session.completed') {
    const session = stripeData as Stripe.Checkout.Session;

    if (session.metadata?.orderId) {
      await handleChristmasOrder(session);
      return;
    }
  }

  if (!('customer' in stripeData)) {
    return;
  }

  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    return;
  }

  const { customer: customerId } = stripeData;

  if (!customerId || typeof customerId !== 'string') {
    console.error(`No customer received on event: ${JSON.stringify(event)}`);
  } else {
    let isSubscription = true;

    if (event.type === 'checkout.session.completed') {
      const { mode } = stripeData as Stripe.Checkout.Session;
      isSubscription = mode === 'subscription';

      console.info(
        `Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`
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
          `Successfully processed one-time payment for session: ${checkout_session_id}`
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

    if (!orderId) {
      console.error('No orderId in session metadata');
      return;
    }

    let downloadLinks: string[];

    if (productType === 'multi_item_cart') {
      downloadLinks = generateMultiItemDownloadLinks(session.metadata?.items);
    } else {
      downloadLinks = generateDownloadLinks(
        productId,
        session.metadata?.designNumber
      );
    }

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
      return;
    }

    console.info(`Successfully processed Christmas order: ${orderId}`);

    await sendOrderEmail(session, productId, downloadLinks, orderId);
  } catch (error) {
    console.error('Error handling Christmas order:', error);
  }
}

async function sendOrderEmail(
  session: Stripe.Checkout.Session,
  productId: string | undefined,
  downloadLinks: string[],
  orderId: string
) {
  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return;
    }

    const recipient = session.customer_email;
    if (!recipient) {
      console.error('No customer_email on session, cannot send email');
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

    // Build button-style links
    const downloadButtonsHtml = downloadLinks
      .map((link, index) => {
        const rawName = link.split('/').pop() || `Design-${index + 1}`;
        const cleanName = rawName.replace(/\.[a-zA-Z0-9]+$/, '');
        return `
          <tr>
            <td align="center" style="padding: 6px 0;">
              <a href="${link}" 
                 style="
                   display:inline-block;
                   padding: 10px 18px;
                   background-color:#16a34a;
                   color:#ffffff;
                   text-decoration:none;
                   border-radius:999px;
                   font-size:14px;
                   font-weight:600;
                 ">
                Download ${cleanName}
              </a>
            </td>
          </tr>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Christmas Magic Designs are Ready!</title>
        </head>
        <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background-color:#f9fafb;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f9fafb;padding:40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#7f1d1d 0%,#14532d 50%,#7f1d1d 100%);padding:40px 30px;text-align:center;">
                      <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:bold;">
                        Christmas Magic Designs
                      </h1>
                      <p style="color:#fef3c7;margin:10px 0 0 0;font-size:16px;">
                        Your order is ready!
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:32px 28px;">
                      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 18px 0;">
                        Thank you for your purchase! Your magical Christmas designs are ready to download and print.
                      </p>

                      <div style="background-color:#f0fdf4;border-left:4px solid #16a34a;padding:18px;margin:20px 0;border-radius:8px;">
                        <p style="color:#15803d;margin:0 0 6px 0;font-weight:bold;font-size:14px;">Order Details</p>
                        <p style="color:#166534;margin:4px 0;font-size:13px;"><strong>Product:</strong> ${productName}</p>
                        <p style="color:#166534;margin:4px 0;font-size:13px;"><strong>Order Number:</strong> ${orderId}</p>
                      </div>

                      <h2 style="color:#1f2937;font-size:18px;margin:26px 0 12px 0;text-align:left;">
                        Download Your Designs
                      </h2>

                      ${
                        downloadLinks.length > 0
                          ? `
                        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
                          ${downloadButtonsHtml}
                        </table>
                        `
                          : `
                        <p style="color:#6b7280;font-size:14px;margin:0 0 24px 0;">
                          Your payment was successful, and your order is being prepared. 
                          If you don't receive a follow-up email with download links within a few minutes, 
                          please reply and we'll send them manually.
                        </p>
                        `
                      }

                      <div style="background-color:#fef3c7;border-radius:8px;padding:18px;margin:16px 0;">
                        <h3 style="color:#78350f;font-size:15px;margin:0 0 8px 0;">Printing Tips</h3>
                        <ul style="color:#92400e;font-size:13px;margin:0;padding-left:20px;line-height:1.6;">
                          <li>Print on white cardstock for best results</li>
                          <li>Use high-quality printer settings</li>
                          <li>Standard 8.5" x 11" paper size</li>
                          <li>Save your files so you can reprint them later</li>
                        </ul>
                      </div>

                      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:18px 0 0 0;">
                        If you have any questions or need assistance, please contact us at
                        <a href="mailto:support@juldd.com" style="color:#16a34a;text-decoration:none;">support@juldd.com</a>.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color:#f9fafb;padding:22px;text-align:center;border-top:1px solid #e5e7eb;">
                      <p style="color:#9ca3af;font-size:13px;margin:0;">
                        © 2024 Christmas Magic Designs by JULDD
                      </p>
                      <p style="color:#9ca3af;font-size:11px;margin:6px 0 0 0;">
                        Made with love for magical holidays
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ChristmasMagicDesigns@juldd.com',
        to: [recipient],
        subject: `Your Christmas Magic Designs are Ready! 🎄`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Resend API error:', errorText);
    } else {
      const data = await res.json();
      console.info('Order email sent via Resend. Message ID:', data.id);
    }
  } catch (error) {
    console.error('Error sending order email via Resend:', error);
  }
}

function generateDownloadLinks(
  productId: string | undefined,
  designNumber: string | undefined
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

  return links;
}

function generateMultiItemDownloadLinks(itemsString: string | undefined): string[] {
  const links: string[] = [];

  if (!itemsString) {
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
      const { error: noSubError } = await supabase
        .from('stripe_subscriptions')
        .upsert(
          {
            customer_id: customerId,
            subscription_status: 'not_started',
          },
          {
            onConflict: 'customer_id',
          }
        );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
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
        }
      );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(
      `Failed to sync subscription for customer ${customerId}:`,
      error
    );
    throw error;
  }
}
