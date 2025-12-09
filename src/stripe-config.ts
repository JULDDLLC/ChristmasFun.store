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
