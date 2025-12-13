async function sendOrderEmail(
  session: Stripe.Checkout.Session,
  productId: string | undefined,
  downloadLinks: string[],
  orderId: string,
) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim();
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')?.trim();

    // Use service role if present, otherwise fall back to anon key
    const authKey = serviceKey || anonKey;

    if (!supabaseUrl || !authKey) {
      console.error('Missing Supabase configuration for email invoke', {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceKey: Boolean(serviceKey),
        hasAnonKey: Boolean(anonKey),
      });
      return;
    }

    // Force-retrieve the session so we can reliably get buyer email
    const fullSession = await stripe.checkout.sessions.retrieve(session.id as string, {
      expand: ['customer_details'],
    });

    const buyerEmail =
      fullSession.customer_details?.email ||
      (fullSession.customer_email as string | null) ||
      (session.customer_details?.email as string | null) ||
      (session.customer_email as string | null);

    if (!buyerEmail) {
      console.error('No buyer email found on session. Cannot send download email.', {
        sessionId: session.id,
      });
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

    const payload = {
      to: buyerEmail,
      productName,
      productType: productId,
      downloadLinks,
      orderNumber: orderId,
    };

    console.info('Sending download email via send-order-email', {
      buyerEmail,
      productId,
      orderId,
      linksCount: Array.isArray(downloadLinks) ? downloadLinks.length : 0,
    });

    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authKey}`,
        apikey: authKey,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await emailResponse.text();

    if (!emailResponse.ok) {
      console.error('send-order-email failed', {
        status: emailResponse.status,
        body: responseText,
        orderId,
        productId,
      });
      return;
    }

    console.info('send-order-email success', {
      status: emailResponse.status,
      body: responseText,
      orderId,
      productId,
    });
  } catch (error) {
    console.error('Error sending order email:', error);
  }
}
