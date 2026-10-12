# ChristmasFun.store

The code behind [christmasfun.store](https://christmasfun.store) — a digital-download shop for printable Christmas products: personalized Santa letters, Christmas notes, coloring pages, and seasonal design bundles (including the Gothmas collection). Customers check out with Stripe and receive their download links by email. No customer accounts, no shipping — everything is a printable file.

## Tech stack

- **Frontend:** Vite 5 + React 18 + TypeScript, Tailwind CSS 3, React Router 7, Lucide icons
- **Backend:** Supabase (Bolt-managed project) — Postgres database + Edge Functions (Deno)
- **Payments:** Stripe Checkout. All Stripe calls happen server-side in Edge Functions; there is no Stripe SDK in the browser.
- **Email delivery:** the `send-order-email` function emails download links after the Stripe webhook confirms payment
- **Build/deploy:** developed in Bolt (project "Premium Christmas Santa Letter Page"), synced to this repo, published to christmasfun.store (Netlify under the hood). Edge Functions can also be edited and deployed from Bolt under Database → Server Functions.

## How a purchase works

1. A customer adds items to the cart on the store page (`src/pages/Christmas.tsx`).
2. The cart drawer sends the items to the `christmas-multi-checkout` Edge Function, which builds a Stripe Checkout session from the items' Stripe price IDs.
3. Stripe returns the customer to `/thank-you` after payment.
4. Stripe calls the `stripe-webhook` function, which records the order and works out which products were bought (its price ID → product key map).
5. The webhook calls `send-order-email`, which emails the buyer their download links (`https://christmasfun.store/download/<slug>`).
6. Download pages (`src/pages/Download.tsx`) map each slug to the hosted file. Product files are hosted outside this repo; the pages list the direct download links.

Single-item purchases use the `christmas-checkout` function instead of the multi-item cart flow.

## Repository map

- `src/pages/Christmas.tsx` — the store itself, and the homepage (`/` and `/christmas` both render it)
- `src/pages/Download.tsx` — download pages, route `/download/:productId`
- `src/pages/ThankYou.tsx` — post-checkout page (`/thank-you`)
- `src/pages/Privacy.tsx`, `src/pages/Terms.tsx` — legal pages
- `src/stripe-config.ts` — the frontend product catalog: Stripe product ID, price ID, name, description, and display price for every product
- `src/contexts/ChristmasCartContext.tsx` — the live cart (line items carry a type plus a Stripe priceId; persisted to localStorage)
- `src/components/` — cart drawer and button, snowfall, background music, lazy images
- `src/lib/supabase.ts` — browser Supabase client (reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- `supabase/functions/` — Edge Functions: `christmas-checkout`, `christmas-multi-checkout`, `stripe-webhook`, `send-order-email`, `download-file` (free coloring sheets), `send-freebie-coloring` (free-sheet email signup), and `stripe-checkout` (template leftover, see below)
- `supabase/migrations/` — database migrations (orders, freebie subscribers, product types, security fixes)
- `public/` — logo, favicon, social share image, background music track

## Adding a new product

1. Create the product and a one-time price in Stripe. Note the product ID and price ID.
2. Add an entry to `STRIPE_PRODUCTS` in `src/stripe-config.ts`.
3. Add the product's type key to the cart item union in `src/contexts/ChristmasCartContext.tsx` (cart items pass their priceId through to checkout).
4. Add the download page entry in `src/pages/Download.tsx` (the `PRODUCT_FILES` map: slug → file links).
5. Add the price ID → product key entry to `PRICE_ID_TO_PRODUCT` in `supabase/functions/stripe-webhook/index.ts`.
6. Add the product key → download URL entry to `PRODUCT_DOWNLOAD_MAP` in `supabase/functions/send-order-email/index.ts`.
7. Add the product's card or section to `src/pages/Christmas.tsx`.
8. Test with a real purchase (a 100%-off promo code works well) and confirm the delivery email contains the correct download link before announcing the product.

Steps 5 and 6 are the easy ones to forget — and they are the two that decide whether the buyer actually receives their files.

## Local development

```bash
npm install
npm run dev        # Vite dev server
npm run build      # production build (vite build — note: type errors do not fail the build)
npm run typecheck
```

Frontend environment variables live in `.env` (never committed): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Edge Function secrets (`STRIPE_SECRET_KEY`, the Stripe webhook secret, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are set in the Supabase/Bolt dashboards, not in this repo.

## A note on the extra pages

This project started from a Bolt template for a subscription SaaS app, and that scaffolding is still in the repo: `/home`, `/products`, `/login`, `/signup`, `/auth`, `/dashboard`, `/success`, a generic `CartContext`, the `stripe-checkout` function, and the auth/subscription components. The live store uses none of it — the Christmas page is the homepage and checkout is anonymous. It is kept for now rather than deleted blind, because a few pieces (like the generic cart drawer) were partially rewired to the Christmas checkout along the way. If you clean it up, re-test `/`, a `/download/...` page, and a full purchase afterward.

One more quirk: `.gitignore` ignores all `*.md` files except this README, plus `notes/`, `prompts/`, and `private/`.
