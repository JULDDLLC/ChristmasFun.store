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

    console.log('EMAIL DEBUG', {
      orderId,
      productId,
      buyerEmail,
      linkCount: Array.isArray(downloadLinks) ? downloadLinks.length : 0,
    });

    if (!buyerEmail) {
      console.error('No buyer email found on session. Cannot send download email.', {
        sessionId: session.id,
      });
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

    const productName = productId
      ? productNames[productId] || 'Christmas Design'
      : 'Christmas Design';

    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authKey}`,
        apikey: authKey,
      },
      body: JSON.stringify({
        to: buyerEmail,
        productName,
        productType: productId || 'unknown',
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
