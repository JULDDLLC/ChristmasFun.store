// src/stripe-config.ts

export interface StripeProduct {
  id: string;        // Stripe product ID: prod_...
  priceId: string;   // Stripe price ID: price_...
  name: string;
  description: string;
  price: number;     // Display price in USD (for UI only)
  currency: string;
  mode: 'subscription' | 'payment'; // All of these are one-time payments
}

/**
 * IMPORTANT:
 * - Replace each REPLACE_WITH_... placeholder below with the actual price_ ID
 *   from your Stripe dashboard.
 * - The prod_ IDs should match exactly what you posted:
 *   Santa Letter (Single) - prod_TZQ2aWVqAN4SzG
 *   Christmas Note (Single) - prod_TZPUQIpa5aK6cV
 *   All 18 Designs Bundle - prod_TZPZj1hniwTEuF
 *   Christmas Notes Bundle (4 Notes) - prod_TZPsGPYV4Mdkmr
 *   Teacher License – prod_TZPwxZFjMvlgfb
 */

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_TZQ2aWVqAN4SzG',
    priceId: 'price_1ScHCUBsr66TjEhQI5HBQqtU', // e.g. price_1ScH... from Stripe
    name: 'Santa Letter (Single)',
    description:
      'One 8.5 x 11 inch printable Santa Letter PNG. Custom, hand-designed artwork by Christmas Fun, not a template.',
    price: 0.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_TZPUQIpa5aK6cV',
    priceId: 'price_1ScGfNBsr66TjEhQxdfKXMcn',
    name: 'Christmas Note (Single)',
    description:
      'One 8.5 x 11 inch printable Christmas Note PNG with original artwork, perfect for heartfelt holiday messages.',
    price: 0.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_TZPsGPYV4Mdkmr',
    priceId: 'price_1ScH30Bsr66TjEhQhwLwFAME',
    name: 'Christmas Notes Bundle (4 Notes)',
    description:
      'Bundle of four 8.5 x 11 inch printable Christmas Notes PNGs, each a unique, custom design by Christmas Fun.',
    price: 2.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_TZPZj1hniwTEuF',
    priceId: 'price_1ScGjvBsr66TjEhQ4cRtPYm1',
    name: 'All 18 Designs Bundle',
    description:
      'Complete set of 14 Santa Letters + 4 Christmas Notes as printable 8.5 x 11 inch PNGs. All custom artwork.',
    price: 9.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_TZPwxZFjMvlgfb',
    priceId: 'price_1ScH6KBsr66TjEhQAhED4Lsd',
    name: 'Teacher License',
    description:
      'One-time classroom license for unlimited classroom printing of all 18 Christmas Fun designs.',
    price: 4.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQSaBe1vxUfaD7',
    priceId: 'price_1UPbfPBsr66TjEhQAgZ52nsc',
    name: 'Gothmas Ornament Design Bundle - 12 Dark Holiday Designs',
    description:
      'Twelve printable ornament designs in a dark, celestial style: a crescent moon and stars, a raven on a branch, black roses, a black cat with a gold bow, and more. High-resolution PNG files (full square artwork) made for printing at home. Instant download from ChristmasFun.store.',
    price: 4.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQSafKDXwPqPXg',
    priceId: 'price_1UPbfkBsr66TjEhQKvjSkHYW',
    name: 'Gothic Winter - Vintage Wall Art Print Set of 3',
    description:
      'Three printable wall art designs in an aged, old-world style: a snow-covered gothic cathedral with warm candlelit windows, a candlelit gothic tree, and a winter raven. Sized for 5x7, 8x10, and 11x14 frames, as print-ready PDF and JPG files. Instant download.',
    price: 2.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQSatP4OxGzpfN',
    priceId: 'price_1UPbfnBsr66TjEhQbVsExDOc',
    name: 'Gothmas Greeting Cards - Printable Set of 6',
    description:
      'Six folded greeting card designs in black, burgundy, and deep green, with ravens, black roses, and celestial details. Blank inside. Print-ready PDF for standard card stock with trim guides, plus the six card fronts as PNG files. Instant download.',
    price: 2.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQSbVY17zpL9vs',
    priceId: 'price_1UPbfsBsr66TjEhQrn4uFnwN',
    name: 'Raven and Rose Gothmas Gift Tags and Wrap Sheets',
    description:
      'Printable gift tags and two coordinating wrap sheet designs in the Gothmas palette: black backgrounds, deep red roses, and small gold details. Tags come 8 to a page, with an editable name version included. Instant download.',
    price: 2.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQSbnkhXHZuZjh',
    priceId: 'price_1UPbfvBsr66TjEhQ4fda2F6C',
    name: 'Gothmas Countdown - Printable Advent Calendar Cards',
    description:
      'A 25-card countdown set with dark celestial artwork, one card for each day from December 1 to Christmas. Every card has a short prompt on the back. Print-ready PDFs in two sizes (4x6 and 2.5x3.5), plus individual card files. Instant download.',
    price: 4.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQSbf15CGf12SL',
    priceId: 'price_1UPbfyBsr66TjEhQaZIpki1T',
    name: 'Gothmas Collection - All 5 Sets Bundle',
    description:
      'The complete Gothmas collection in one download: the 12-design ornament bundle, the Gothic Winter wall art set, the set of 6 greeting cards, the gift tags and wrap sheets, and the 25-card countdown. Instant download.',
    price: 9.99,
    currency: 'usd',
    mode: 'payment',
  },
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};

export const getSubscriptionProducts = (): StripeProduct[] => {
  // You don’t have any subscriptions right now, but we’ll keep this for future use.
  return STRIPE_PRODUCTS.filter(product => product.mode === 'subscription');
};

export const getOneTimeProducts = (): StripeProduct[] => {
  return STRIPE_PRODUCTS.filter(product => product.mode === 'payment');
};
