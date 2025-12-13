import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return new Response('Missing signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    const body = await req.text()

    // ✅ REQUIRED for Deno / Supabase Edge
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      endpointSecret
    )
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ received: true }), { status: 200 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  const productId = session.metadata?.product_id
  const orderId = session.metadata?.order_id

  if (!productId || !orderId) {
    console.error('❌ Missing productId or orderId in metadata', session.metadata)
    return new Response('Missing metadata', { status: 400 })
  }

  // 🔗 BUILD DOWNLOAD LINKS (YOUR FILE LOGIC GOES HERE)
  const downloadLinks: string[] = []

  // Example — replace paths if needed
  if (productId === 'single_letter_99') {
    downloadLinks.push(`https://christmasfun.store/download/santa-letter`)
  }

  if (productId === 'single_note_99') {
    downloadLinks.push(`https://christmasfun.store/download/christmas-note`)
  }

  if (productId === 'notes_bundle_299') {
    downloadLinks.push(`https://christmasfun.store/download/notes-bundle`)
  }

  if (productId === 'all_18_bundle_999') {
    downloadLinks.push(
      `https://christmasfun.store/download/all-18-bundle`
    )
  }

  if (productId === 'coloring_bundle_free') {
    downloadLinks.push(
      `https://christmasfun.store/download/free-coloring`
    )
  }

  console.log('✅ DOWNLOAD LINK DEBUG', {
    productId,
    linkCount: downloadLinks.length,
    links: downloadLinks,
  })

  // 📧 SEND EMAIL
  const emailRes = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-order-email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      },
      body: JSON.stringify({
        to: session.customer_details?.email,
        productName: productId,
        productType: productId,
        downloadLinks,
        orderNumber: orderId,
      }),
    }
  )

  if (!emailRes.ok) {
    const txt = await emailRes.text()
    console.error('❌ Email send failed:', txt)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
