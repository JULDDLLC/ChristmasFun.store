# Deployment Guide - Christmas Magic Designs

## Quick Start: Deploy to Netlify

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI** (if not already installed):
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**:
```bash
netlify login
```

3. **Deploy your site**:
```bash
netlify deploy --prod
```

Follow the prompts:
- Create & configure a new site? **Yes**
- Team: Select your team
- Site name: Enter a name (or leave blank for auto-generated)
- Publish directory: **dist**

### Option 2: Deploy via Netlify Dashboard

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Deploy manually"
3. Drag and drop your `dist` folder
4. Your site will be live in seconds!

### Option 3: Deploy via Git (Best for continuous deployment)

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [Netlify](https://app.netlify.com/)
3. Click "Add new site" → "Import an existing project"
4. Connect your Git provider
5. Select your repository
6. Netlify will auto-detect the settings from `netlify.toml`
7. Click "Deploy site"

---

## Connect Your GoDaddy Domain: christmassfun.store

### Step 1: Get Netlify DNS Information

After deploying, in your Netlify dashboard:

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter: `christmassfun.store`
4. Click **Verify**
5. Netlify will provide you with DNS records

### Step 2: Configure DNS in GoDaddy

#### Option A: Use Netlify DNS (Recommended - Easier)

1. In Netlify, under Domain settings, click **"Set up Netlify DNS"**
2. Netlify will show you nameservers like:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```

3. Go to [GoDaddy Domain Manager](https://dcc.godaddy.com/manage/christmassfun.store/dns)
4. Scroll to **Nameservers** section
5. Click **Change Nameservers**
6. Select **"I'll use my own nameservers"**
7. Enter the Netlify nameservers (provided in step 2)
8. Click **Save**

**Note**: DNS propagation can take 24-48 hours, but usually completes within 2-4 hours.

#### Option B: Use GoDaddy DNS (Keep GoDaddy nameservers)

1. Go to [GoDaddy Domain Manager](https://dcc.godaddy.com/manage/christmassfun.store/dns)
2. Click **DNS** → **Manage DNS**
3. Add/Edit the following records:

   **For root domain (christmassfun.store):**
   - Type: `A`
   - Name: `@`
   - Value: `75.2.60.5` (Netlify's load balancer)
   - TTL: `600` seconds

   **For www subdomain:**
   - Type: `CNAME`
   - Name: `www`
   - Value: `[your-site-name].netlify.app` (get from Netlify)
   - TTL: `600` seconds

4. Click **Save**

### Step 3: Configure HTTPS

1. In Netlify dashboard, go to **Domain settings**
2. Scroll to **HTTPS**
3. Click **Verify DNS configuration**
4. Once verified, click **Provision certificate**
5. Netlify will automatically set up SSL/TLS (Let's Encrypt)

Your site will be available at:
- `https://christmassfun.store`
- `https://www.christmassfun.store`

---

## Environment Variables

Make sure to add your environment variables in Netlify:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY` (if using Stripe)

---

## Post-Deployment Checklist

- [ ] Site is live and accessible
- [ ] Custom domain is connected
- [ ] HTTPS/SSL is enabled
- [ ] Environment variables are configured
- [ ] Test all functionality:
  - [ ] Email signup for free coloring sheets
  - [ ] Stripe checkout flows
  - [ ] All image assets loading correctly
  - [ ] Responsive design on mobile
  - [ ] Background music functionality
  - [ ] All navigation links working

---

## Troubleshooting

### Domain not working?
- Wait 2-4 hours for DNS propagation
- Check DNS records using: `dig christmassfun.store` or [whatsmydns.net](https://www.whatsmydns.net/)
- Make sure you've verified the domain in Netlify

### Images not loading?
- Ensure all image URLs in the code are correct
- Check browser console for 404 errors
- Verify image paths match your deployed assets

### Stripe not working?
- Verify environment variables are set in Netlify
- Check Supabase Edge Functions are deployed
- Ensure Stripe webhook URL is updated to production domain

---

## Support

For issues with:
- **Netlify**: [Netlify Support](https://www.netlify.com/support/)
- **GoDaddy DNS**: [GoDaddy Support](https://www.godaddy.com/help)
- **This Application**: christmasmagicdesigns@juldd.com
