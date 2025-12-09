# Christmas Magic Designs 🎄

A beautiful, festive React application for selling Christmas-themed digital products including Letters to Santa and Christmas coloring sheets.

## Features

- **14 Magical Santa Letters**: Unique, professionally designed letters with various themes (traditional, gaming-inspired, and modern)
- **Christmas Notes Collection**: 4 beautiful note designs for holiday correspondence
- **Free Coloring Sheets**: 10 high-quality coloring pages (5 intricate adult designs + 5 fun kids designs)
- **Stripe Integration**: Secure payment processing for individual items, bundles, and teacher licenses
- **Email Delivery**: Automated email delivery of purchased items and free downloads
- **Premium Design**: Glassmorphic cards, snowfall effects, background music, and festive animations
- **Responsive Layout**: Optimized for all devices from mobile to desktop

## Products Available

1. **Individual Santa Letters** - $0.99 each
2. **Individual Christmas Notes** - $0.99 each
3. **Santa Letters Bundle** - $9.99 (all 14 letters)
4. **Christmas Notes Bundle** - $2.99 (all 4 notes)
5. **Complete Bundle** - $9.99 (18 designs: 14 letters + 4 notes)
6. **Teacher License** - $4.99 (unlimited classroom printing)
7. **Free Coloring Sheets** - Free with email signup

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Supabase Configuration

1. Create a new Supabase project
2. Run the database migration to set up the required tables
3. Configure the Stripe environment variables in your Supabase project settings:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

### 3. Stripe Configuration

1. Create a Stripe account and get your API keys
2. Set up webhook endpoints in your Stripe dashboard pointing to your Supabase edge functions
3. Configure the webhook to listen for the following events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 4. Installation

```bash
npm install
npm run dev
```

## Database Schema

The application uses the following main tables:

- `stripe_customers`: Links Supabase users to Stripe customers
- `stripe_subscriptions`: Manages subscription data and status
- `stripe_orders`: Stores order information for one-time purchases

## Edge Functions

Two Supabase edge functions handle Stripe integration:

1. **stripe-checkout**: Creates Stripe checkout sessions
2. **stripe-webhook**: Processes Stripe webhook events

## Authentication

- Email/password authentication via Supabase
- No email confirmation required
- Secure session management
- Protected routes with authentication guards

## Payment Flow

1. User browses products on the Products page
2. Clicking "Buy Now" or "Subscribe" creates a Stripe checkout session
3. User completes payment on Stripe's secure checkout page
4. Webhook processes the payment and updates the database
5. User is redirected to a success page

## Security Features

- Row Level Security (RLS) enabled on all database tables
- JWT token validation for API requests
- Secure webhook signature verification
- Protected user data access

## Development

The application is built with:

- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- React Router for navigation
- Supabase for backend services
- Stripe for payment processing

## Deployment

### Quick Deploy

**Automated deployment script:**
```bash
./deploy.sh
```

**Manual deployment:**
```bash
npm run build
netlify deploy --prod
```

### Custom Domain Setup (christmassfun.store)

For detailed deployment and domain configuration instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

**Quick steps:**
1. Deploy to Netlify (using CLI, dashboard, or Git)
2. Add custom domain in Netlify dashboard
3. Update GoDaddy DNS settings with Netlify nameservers or A/CNAME records
4. Configure environment variables in Netlify
5. Enable HTTPS/SSL (automatic with Netlify)

### Production Checklist

- [ ] Build succeeds without errors
- [ ] Environment variables configured in hosting platform
- [ ] Custom domain connected and SSL enabled
- [ ] Stripe webhooks updated to production URLs
- [ ] Email delivery tested (Resend API keys configured)
- [ ] All payment flows tested in Stripe test mode
- [ ] Supabase Edge Functions deployed and operational

## Support

For issues related to:
- Authentication: Check Supabase configuration and RLS policies
- Payments: Verify Stripe webhook configuration and edge function logs
- Database: Review migration files and table permissions