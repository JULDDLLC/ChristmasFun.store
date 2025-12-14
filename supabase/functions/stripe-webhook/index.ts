import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import Stripe from 'npm:stripe@14.21.0'

const STRIPE_SECRET_KEY = (Deno.env.get('STRIPE_SECRET_KEY') || '').trim()
const STRIPE_WEBHOOK_SECRET = (Deno.env.get('STRIPE_WEBHOOK_SECRET') || '').trim()
const SUPABASE_URL = (Deno.env.get('SUPABASE_URL') || '').trim()
const SERVICE_KEY = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim()
const ANON_KEY = (Deno.env.get('SUPABASE_ANON_KEY') || '').trim()

const authKey = SERVICE_KEY || ANON_KEY

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// IMPORTANT: Your real Stripe price IDs (from your memory)
const PRICE_TO_PRODUCT_ID: Record<string, string> = {
  // Single Santa Letter (0.99)
  price_1ScHCUBsr66TjEhQI5HBQqtU: 'single_letter_99',
  // Christmas Note (0.99)
  price_1ScGfNBsr66TjEhQxdfKXMcn: 'single_note_99',
  // Christmas Notes Bundle (2.99)
  price_1ScH30Bsr66TjEhQhwLwFAME: 'notes_bundle_299',
  // All 18 Designs Bundle (9.99)
  price_1ScGjvBsr66TjEhQ4cRtPYm1: 'all_18_bundle_999',
  // Teacher License (4.99)
  price_1ScH6KBsr66TjEhQAhED4Lsd: 'teacher_license_499',
  // Free Coloring Sheets
  price_1SctvEBsr66TjEhQ5XQ8NUxl: 'coloring_bundle_free',
}

const PRODUCT_NAME: Record<string, string> = {
  single_letter_99: 'Single Santa Letter Design',
  single_note_99: 'Single Christmas Note Design',
  notes_bundle_299: 'Christmas Notes Bundle (All 4 Notes)',
  all_18_bundle_999: 'All 18 Designs Bundle (14 Letters + 4 Notes)',
  teacher_license_499: 'Teacher License',
  coloring_bundle_free: 'Free Coloring Sheets Bundle',
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)))
}

async function getSessionWithLineItems(sessionId: string) {
  // expand line_items so we can read price ids if metadata is missing
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items.data.price', 'customer_details'],
  })
}

async function sendOrderEmail(params: {
  to: string
  productIds: string[]
  orderId: string
  downloadLinks: string[]
}) {
  if (!SUPABASE_URL || !authKey) {
    console.error('EMAIL INVOKE ERROR: missing SUPABASE_URL or authKey', {
      hasSupabaseUrl: Boolean(SUPABASE_URL),
      hasAuthKey: Boolean(authKey),
    })
    return
  }

  const primaryProductId = params.productIds[0] || 'unknown'
  const productName = PRODUCT_NAME[primaryProductId] || 'Christmas Designs'

  // Send BOTH key styles to avoid "Missing required fields" regardless of what send-order-email expects
  const payload: any = {
    // likely required
    to: params.to,

    // camelCase
    productName,
    productType: primaryProductId,
    orderNumber: params.orderId,
    downloadLinks: params.downloadLinks,
    productIds: params.productIds,

    // snake_case duplicates
    product_name: productName,
    product_type: primaryProductId,
    order_number: params.orderId,
    download_links: params.downloadLinks,
    product_ids: params.productIds,
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/send-order-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authKey}`,
      apikey: authKey,
    },
    body: JSON.stringify(payload),
  })

  const text = await res.text().catch(() => '')
  if (!res.ok) {
    console.error('Email send failed', { status: res.status, body: text })
    return
  }

  console.log('Email send OK', { body: text })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return new Response(JSON.stringify({ error: 'Missing signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let event: Stripe.Event
  try {
    const rawBody = await req.text()

    // Required on Supabase Edge / Deno
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed', err)
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ received: true, type: event.type }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const sessionLite = event.data.object as Stripe.Checkout.Session
  const sessionId = String(sessionLite.id || '')

  try {
    const session = await getSessionWithLineItems(sessionId)

    const md = (session.metadata || {}) as Record<string, any>

    // Accept both formats
    const orderId =
      (md.order_id as string) ||
      (md.orderId as string) ||
      (md.order_number as string) ||
      (md.orderNumber as string) ||
      ''

    // product_id can be single, product_ids can be comma list or json
    const rawProduct =
      (md.product_id as string) ||
      (md.productId as string) ||
      (md.product_ids as string) ||
      (md.productIds as string) ||
      ''

    console.log('WEBHOOK METADATA RECEIVED', {
      sessionId,
      metadataKeys: Object.keys(md),
      metadata: md,
    })

    let productIds: string[] = []

    // If metadata gave us something, try to parse it
    if (rawProduct) {
      const trimmed = String(rawProduct).trim()

      // Comma-separated
      if (trimmed.includes(',')) {
        productIds = trimmed.split(',').map((s) => s.trim())
      } else {
        // JSON array string?
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
          try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) productIds = parsed.map(String)
            else productIds = [String(parsed)]
          } catch {
            productIds = [trimmed]
          }
        } else {
          productIds = [trimmed]
        }
      }
    }

    // Fallback: derive from line_items price ids
    if (!productIds.length) {
      const lineItems = (session.line_items?.data || []) as any[]
      const priceIds = lineItems
        .map((li) => li?.price?.id)
        .filter(Boolean)
        .map(String)

      productIds = priceIds.map((pid) => PRICE_TO_PRODUCT_ID[pid]).filter(Boolean)

      console.log('FALLBACK FROM LINE ITEMS', {
        sessionId,
        priceIds,
        mappedProductIds: productIds,
      })
    }

    productIds = uniq(productIds)

    const buyerEmail =
      session.customer_details?.email ||
      (session.customer_email as string | null) ||
      ''

    if (!buyerEmail) {
      console.error('No buyer email on session', { sessionId })
      return new Response(JSON.stringify({ received: true, warning: 'missing_buyer_email' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // If still no productIds, we cannot generate links, but we log HARD
    if (!productIds.length) {
      console.error('No product IDs found via metadata or line items', {
        sessionId,
        metadata: md,
      })

      // Send a fallback email so customer is not stranded
      await sendOrderEmail({
        to: buyerEmail,
        productIds: ['unknown'],
        orderId: orderId || sessionId,
        downloadLinks: [],
      })

      return new Response(JSON.stringify({ received: true, warning: 'missing_product_ids' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Build download links. Replace these URLs with your real endpoints if different.
    // These can be direct downloads, a signed URL endpoint, or a page that lists downloads.
    const downloadLinks = productIds.map((pid) => {
      // Example consistent download route
      return `https://christmasfun.store/download/${encodeURIComponent(pid)}`
    })

    console.log('DOWNLOAD LINK DEBUG', {
      orderId: orderId || '(missing)',
      productIds,
      linkCount: downloadLinks.length,
      links: downloadLinks,
    })

    await sendOrderEmail({
      to: buyerEmail,
      productIds,
      orderId: orderId || sessionId,
      downloadLinks,
    })

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('Webhook handler failed', err)
    return new Response(JSON.stringify({ error: err?.message || 'Webhook failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
