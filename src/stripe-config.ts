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
 *   Christmas Classics Bundle (All 24 Designs) - prod_TZPZj1hniwTEuF
 *   Christmas Notes Bundle (4 Notes) - prod_TZPsGPYV4Mdkmr
 *   Teacher License: prod_TZPwxZFjMvlgfb
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
    name: 'Christmas Classics Bundle',
    description:
      'Complete set of 20 Santa Letters + 4 Christmas Notes as printable 8.5 x 11 inch PNGs. All custom artwork.',
    price: 9.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_TZPwxZFjMvlgfb',
    priceId: 'price_1ScH6KBsr66TjEhQAhED4Lsd',
    name: 'Teacher License',
    description:
      'One-time classroom license for unlimited classroom printing of all 24 Christmas Classics designs (20 Santa Letters + 4 Christmas Notes).',
    price: 4.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQSaBe1vxUfaD7',
    priceId: 'price_1UPbfPBsr66TjEhQAgZ52nsc',
    name: 'Gothmas Ornament Design Bundle - 12 Dark Holiday Designs',
    description:
      'Twelve printable ornament designs in a dark, celestial style: a crescent moon and stars, a raven on a branch, black roses, a black cat with a gold bow, and more. Supplied as full square art with each ornament pictured whole, cap and ring included, ready to place inside your own round template or frame, or display in a blank ornament (flat wood or ceramic blanks, or inside clear fillable ornaments). High-resolution PNG files. Instant download from ChristmasFun.store.',
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
  {
    id: 'prod_VQevsTEug9hXfM',
    priceId: 'price_1UPnc7Bsr66TjEhQWXtfdtIA',
    name: 'Nutcracker Wall Art Bundle - Set of 8',
    description:
      'Eight printable wall art designs from the ballet: the Nutcracker soldier standing guard, the Sugar Plum Fairy, Clara\'s Christmas Eve, the Mouse King, the Land of Sweets, and more. Jewel tones with gold details. Print-ready PDF and JPG files sized for 5x7, 8x10, and 11x14 frames. Instant download.',
    price: 4.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQewc5R0iXX4yT',
    priceId: 'price_1UPnc9Bsr66TjEhQ6PU6D7o1',
    name: 'Color-Your-Own Nutcracker Wrap & Poster',
    description:
      'One oversized Nutcracker coloring design with a drummer soldier, a Christmas tree, the Sugar Plum Fairy, and candy. Print it large as a poster or table cover for kids to color, or use the tiled pages as gift wrap. Print-ready PDF at poster, letter, and wrap scales, plus the design as a PNG file. Instant download.',
    price: 2.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQewfGZefTpUHt',
    priceId: 'price_1UPncCBsr66TjEhQUmAoiOba',
    name: 'Nutcracker Party Printable Kit',
    description:
      'Everything printable for a Nutcracker-themed party in one download: invitations with fill-in fields, tent place cards, a bunting banner that spells NUTCRACKER, food and drink labels, and thank-you cards. Jewel tones and gold throughout, with the Nutcracker soldier and Sugar Plum Fairy as the main figures. Print-ready PDFs. Instant download.',
    price: 4.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQewF9ohOCWF6B',
    priceId: 'price_1UPncEBsr66TjEhQrF2AJXBG',
    name: 'Personalized Nutcracker Ornament',
    description:
      'A toy-soldier ornament design with room for a name and 2026, in three colorways: classic red, emerald, and plum. Open the editable PDF, click the name and year fields, type yours in, and print - no extra software needed. Print-ready PDF and PNG files included. Instant download.',
    price: 4.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQew8nMhWptClD',
    priceId: 'price_1UPncHBsr66TjEhQLNju2iU7',
    name: 'Sugar Plum Cocoa Bar & Recipe Cards',
    description:
      'Printable signs and recipe cards for a Nutcracker-themed hot cocoa bar: an 8.5x11 cocoa bar sign, topping labels, and recipe cards for classic cocoa, peppermint cocoa, and spiced cocoa. Plum, cream, and gold design. Print-ready PDFs. Instant download.',
    price: 3.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQewQIJ6vlokE3',
    priceId: 'price_1UPncJBsr66TjEhQVrePkRnV',
    name: 'Nutcrackercore - The Full Collection',
    description:
      'The complete Nutcrackercore collection in one download: the 8-print wall art bundle, the color-your-own wrap and poster, the party printable kit, the personalized ornament, and the Sugar Plum cocoa bar set. Instant download.',
    price: 9.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQfOjg3b64aPuG',
    priceId: 'price_1UPo4BBsr66TjEhQ47OQNQlz',
    name: 'Our First Christmas Engaged - Editable Ornament',
    description:
      'A printable ornament for couples who got engaged this year: a glossy ruby bauble with gold rings on deep emerald, with a cream banner for your names. Open the editable PDF, click the name and year fields, type yours in, and print - no extra software needed. A filled sample and the blank PNG design are included. Instant download.',
    price: 4.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQfPxG280WFrXA',
    priceId: 'price_1UPo4DBsr66TjEhQoBY2dpuZ',
    name: 'Baby\'s First Christmas 2026 - Editable Photo Ornament',
    description:
      'A photo ornament frame for a baby\'s first Christmas in three colorways: jewel rose-pink, sapphire blue, and classic red-green, each with an oval photo window, a teddy and booties, and a name plate. Open the editable PDF, click the name field, type the baby\'s name in, and print - no extra software needed. Instructions for sizing and placing the photo are included. Instant download.',
    price: 4.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQfPS1UukJdmxI',
    priceId: 'price_1UPo4FBsr66TjEhQw4HquAvT',
    name: 'Gingerbread Name Ornaments and Stocking Tags - Editable Set',
    description:
      'Gingerbread name tags that work as tree ornaments or stocking tags, with four figures: a boy, a little boy, a girl, and a plain gingerbread. Open the editable PDF, click the name fields, type a name for every kid in the family, and print - no extra software needed. Blank and filled-sample sheets, single-tag PNGs, and cut-out figure PNGs are included. Instant download.',
    price: 2.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQfPVskc1mC0Uj',
    priceId: 'price_1UPo4HBsr66TjEhQPsaoETnj',
    name: 'The 2026 Year in Review - Keepsake Ornament Card',
    description:
      'A keepsake ornament card that sums up your family\'s 2026, with room for the family name and five of the year\'s big moments. Open the editable PDF, click the fields, type yours in, and print - no extra software needed. Prints flat as a card or hangs as an ornament. A filled sample is included. Instant download.',
    price: 3.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQfPEhb49PeF7N',
    priceId: 'price_1UPo4KBsr66TjEhQQTrj8HzZ',
    name: 'Pet\'s First Christmas - Editable Photo Ornament',
    description:
      'Two photo ornament frames in one download, one for a puppy and one for a kitten, each with a paw-print ring and an oval photo window. Open the editable PDF for your pet, click the name and year fields, type theirs in, and print, no extra software needed. Instructions for sizing and placing the photo are included. Instant download.',
    price: 4.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VQfPhThhNeMCs5',
    priceId: 'price_1UPo4MBsr66TjEhQMIEzjICq',
    name: 'Personalized Ornaments - The Full Collection',
    description:
      'The complete Personalized Ornaments collection in one download: the engaged ornament, the baby\'s first Christmas photo ornament, the gingerbread name ornament and stocking tag set, the 2026 year in review keepsake card, and the pet\'s first Christmas photo ornament. Every set is editable - type names and details into the PDF fields and print, no extra software needed. Instant download.',
    price: 9.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VVV1rS10JJCyHY',
    priceId: 'price_1UUU19Bsr66TjEhQPV367Jqt',
    name: 'Christmas Memory Night Kit',
    description:
      'Everything you need to host the Christmas night your family talks about all year, planned for you in one printable kit. Inside the 43 page PDF: a host guide that runs the whole evening for you, ready in 20 minutes of simple printing; 6 coordinated games for every age at the table, from toddlers to great grandparents; 36 conversation cards in three levels, including prompts that finally get Grandma and Grandpa\'s stories told; a 2026 family keepsake activity to fill in, save, and reopen next Christmas; a 24 item photo scavenger hunt that gets everyone up, laughing, and actually taking the photos; 8 large print recipe cards of tested Christmas classics, each with Kids Can and Grown Ups steps so cooking together is part of the night; plus a Finishing Touches section with 24 From Santa gift tags, a gift list and budget tracker, a My Letter to Santa page, and a Nice List Certificate. Personalize the host name and family name right in the PDF before you print. Instant download, print at home, use it again every year.',
    price: 14.99,
    currency: 'usd',
    mode: 'payment',
  },
  {
    id: 'prod_VVacOkCIL3pFLE',
    priceId: 'price_1UUZROBsr66TjEhQpbSjSgQ0',
    name: 'The 24 Day Elf Kit',
    description:
      '73 pages of elf magic, planned for you. Boy and girl elf editions of the arrival and goodbye letters, an Elf Adoption Certificate and Christmas Eve Final Report, 24 daily elf notes, 36 handwritten mini cards including Night Off excuse cards and Secret Missions for older kids, a fillable Elf Passport, the Official Nice O Meter, a wish list letter to Santa, a 14 page games pack with 4 unique bingo boards, props and signs, Magic Dust labels, a printable sheet of 12 embossed North Pole seals, 2 coloring pages, and a parent guide with a 24 night staging calendar, a letter from Santa to the parents, the Keeping the Magic guide, and the Santa\'s Helper Invitation for tweens and teens. 38 fillable fields type right in the PDF. Instant download, print at home on US Letter paper.',
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
