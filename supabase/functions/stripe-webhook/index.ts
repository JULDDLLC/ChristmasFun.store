import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const PRODUCT_DOWNLOAD_MAP: Record<string, string[]> = {
  'single_letter_99': ['https://christmasfun.store/download/santa-letter'],
  'single_note_99': ['https://christmasfun.store/download/christmas-note'],
  'notes_bundle_299': ['https://christmasfun.store/download/notes-bundle'],
  'bundle_14_999': ['https://christmasfun.store/download/santa-letters-bundle'],
  'complete_bundle_999': ['https://christmasfun.store/download/all-18-bundle'],
  'all_18_bundle_999': ['https://christmasfun.store/download/all-18-bundle'],
  'teacher_license_499': ['https://christmasfun.store/download/teacher-license'],
  'coloring_bundle_free': ['https://christmasfun.store/download/free-coloring'],

  'santa_letter': ['https://christmasfun.store/download/santa-letter'],
  'christmas_note': ['https://christmasfun.store/download/christmas-note'],
  'notes_bundle': ['https://christmasfun.store/download/notes-bundle'],
  'all_18_bundle': ['https://christmasfun.store/download/all-18-bundle'],
  'teacher_license': ['https://christmasfun.store/download/teacher-license'],
  'free_coloring': ['https://christmasfun.store/download/free-coloring'],
}

function getDownloadLinksForProduct(productId: string): string[] {
  const links = PRODUCT_DOWNLOAD_MAP[productId] || []
  console.log(`📦 Product mapping for "${productId}":`, links)
  return links
}

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

  console.log('✅ WEBHOOK RECEIVED - Session metadata:', JSON.stringify(session.metadata, null, 2))
  console.log('✅ Customer email:', session.customer_details?.email)
  console.log('✅ Session ID:', session.id)

  const productId = session.metadata?.product_id || session.metadata?.productId
  const orderId = session.metadata?.order_id || session.metadata?.orderId

  console.log('✅ EXTRACTED METADATA', {
    productId,
    orderId,
    rawMetadata: session.metadata,
  })

  if (!productId || !orderId) {
    console.error('❌ Missing productId or orderId in metadata', {
      metadata: session.metadata,
      checkedKeys: ['product_id', 'productId', 'order_id', 'orderId'],
      productId,
      orderId,
    })
    return new Response('Missing metadata', { status: 400 })
  }

  const productIds = productId.includes(',') ? productId.split(',') : [productId]

  const downloadLinks: string[] = []
  for (const pid of productIds) {
    const links = getDownloadLinksForProduct(pid.trim())
    downloadLinks.push(...links)
  }

  const uniqueDownloadLinks = [...new Set(downloadLinks)]

  console.log('✅ DOWNLOAD LINKS GENERATED', {
    productId,
    productIds,
    orderId,
    linkCount: uniqueDownloadLinks.length,
    links: uniqueDownloadLinks,
  })

  if (uniqueDownloadLinks.length === 0) {
    console.warn('⚠️ No download links found for products:', productIds)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (supabaseUrl && supabaseKey) {
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: 'completed',
          stripe_payment_intent: session.payment_intent,
          download_links: uniqueDownloadLinks,
          updated_at: new Date().toISOString(),
        }),
      })

      if (!updateRes.ok) {
        const errorText = await updateRes.text()
        console.error('❌ Failed to update order in database:', errorText)
      } else {
        console.log('✅ Order updated in database:', orderId)
      }
    }
  } catch (dbError) {
    console.error('❌ Database update error:', dbError)
  }

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
        downloadLinks: uniqueDownloadLinks,
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
