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

    // Force-retrieve the session so we can reliably get the buyer email
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

    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({
        to: buyerEmail,
        productName,
        productType: productId,
        downloadLinks,
        orderNumber: orderId,
      }),
    });

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
