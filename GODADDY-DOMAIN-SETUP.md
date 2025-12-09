# GoDaddy Domain Setup Guide
## Connect christmassfun.store to Netlify

### Prerequisites
- Domain purchased from GoDaddy: **christmassfun.store**
- Site deployed to Netlify
- Access to both GoDaddy and Netlify accounts

---

## Step-by-Step Instructions

### Step 1: Deploy Your Site to Netlify

If you haven't deployed yet, run:
```bash
./deploy.sh
```

Or manually:
```bash
npm run build
netlify deploy --prod
```

Note your Netlify site name (e.g., `christmas-magic-abc123.netlify.app`)

---

### Step 2: Add Custom Domain in Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Select your Christmas Magic Designs site
3. Go to **Site settings** → **Domain management**
4. Click **Add custom domain**
5. Enter: `christmassfun.store`
6. Click **Verify** → **Yes, add domain**
7. Netlify will show you need to configure DNS

---

### Step 3: Choose Your DNS Configuration Method

#### 🌟 RECOMMENDED: Option A - Use Netlify DNS (Easiest)

**Advantages:**
- Automatic SSL certificate
- Faster setup
- Netlify handles everything
- Better performance with their CDN

**Steps:**

1. In Netlify, under Domain settings, click **"Set up Netlify DNS"**
2. Click **"Verify"** then **"Add domain"**
3. Netlify will provide you with 4 nameservers, like:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
   **⚠️ IMPORTANT: Copy these exact nameservers!**

4. Go to [GoDaddy Domain Management](https://dcc.godaddy.com/)
5. Find **christmassfun.store** and click **DNS**
6. Scroll down to **Nameservers** section
7. Click **Change**
8. Select **"I'll use my own nameservers"**
9. Enter all 4 Netlify nameservers:
   - Nameserver 1: `dns1.p01.nsone.net`
   - Nameserver 2: `dns2.p01.nsone.net`
   - Nameserver 3: `dns3.p01.nsone.net`
   - Nameserver 4: `dns4.p01.nsone.net`
10. Click **Save**

**⏱️ DNS Propagation Time:** 2-48 hours (usually 2-4 hours)

---

#### Option B - Keep GoDaddy DNS (Alternative)

**Use this if you need to keep email or other services with GoDaddy**

1. Go to [GoDaddy Domain Management](https://dcc.godaddy.com/)
2. Find **christmassfun.store** and click **DNS**
3. Click **Add** to create new records

**Add the following records:**

**For apex domain (christmassfun.store):**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 75.2.60.5 | 600 seconds |

**For www subdomain:**
| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | [your-site].netlify.app | 600 seconds |

Replace `[your-site]` with your actual Netlify site name

4. **Delete any conflicting records:**
   - Remove any existing A records pointing to @ (root domain)
   - Remove any CNAME records for www

5. Click **Save** for all changes

**⏱️ DNS Propagation Time:** 30 minutes to 2 hours

---

### Step 4: Verify DNS Configuration

**Check DNS Propagation:**

Use these tools to verify your DNS changes:
- [whatsmydns.net](https://www.whatsmydns.net/) - Check global DNS propagation
- [dnschecker.org](https://dnschecker.org/) - Multi-location DNS checker

Enter `christmassfun.store` and check:
- **A Record** should point to `75.2.60.5` (if using Option B)
- **Nameservers** should be Netlify's (if using Option A)

**Command Line Check:**
```bash
# Check nameservers (Mac/Linux)
dig NS christmassfun.store

# Check A record
dig christmassfun.store

# Windows users:
nslookup christmassfun.store
```

---

### Step 5: Enable HTTPS in Netlify

1. Return to Netlify dashboard
2. Go to **Site settings** → **Domain management**
3. Scroll to **HTTPS** section
4. Click **Verify DNS configuration**
5. Once DNS is verified, Netlify will automatically provision an SSL certificate
6. Wait 5-10 minutes for SSL to activate

**Enable HTTPS redirect:**
- Toggle **Force HTTPS** to ON
- This redirects all HTTP traffic to HTTPS

---

### Step 6: Test Your Site

Visit these URLs to confirm everything works:

1. `http://christmassfun.store` → Should redirect to HTTPS
2. `https://christmassfun.store` → Main site
3. `https://www.christmassfun.store` → Should also work
4. Test on mobile device
5. Test all payment flows and email signups

---

## Troubleshooting

### ❌ "Site not found" or "Cannot reach site"

**Cause:** DNS hasn't propagated yet
**Solution:**
- Wait 2-4 more hours
- Clear your browser cache
- Try incognito/private browsing
- Try a different device/network

### ❌ "Your connection is not private" SSL error

**Cause:** SSL certificate not provisioned yet
**Solution:**
- Wait 10-15 minutes after DNS verification
- In Netlify, go to Domain settings → HTTPS
- Click **Renew certificate** if available

### ❌ Site loads but images/styles missing

**Cause:** Incorrect asset paths or environment variables
**Solution:**
- Check Netlify environment variables are set
- Verify build completed successfully
- Check browser console for errors

### ❌ www subdomain not working

**Solution:**
- Add `www.christmassfun.store` as a domain alias in Netlify
- Verify CNAME record in DNS

---

## Important Notes

### Email Addresses
If you have email addresses with GoDaddy (e.g., `admin@christmassfun.store`):
- **Option A (Netlify DNS):** You'll need to add MX records in Netlify DNS
- **Option B (GoDaddy DNS):** Email will continue working normally

### Domain Privacy
Make sure domain privacy is enabled in GoDaddy to protect your personal information.

### DNS Caching
Your ISP may cache old DNS records. If site doesn't load:
- Try mobile network instead of WiFi
- Use a VPN
- Flush DNS cache on your computer

**Flush DNS (Mac):**
```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

**Flush DNS (Windows):**
```bash
ipconfig /flushdns
```

---

## Production Environment Variables

Don't forget to add these in Netlify:

**Site settings → Environment variables:**

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

---

## Support Resources

- **Netlify Docs:** [netlify.com/docs](https://docs.netlify.com/)
- **GoDaddy DNS Help:** [godaddy.com/help/dns](https://www.godaddy.com/help/dns)
- **DNS Propagation Checker:** [whatsmydns.net](https://www.whatsmydns.net/)
- **SSL Certificate Help:** [netlify.com/docs/ssl](https://docs.netlify.com/domains-https/https-ssl/)

---

## Success! 🎉

Once everything is working:
- Your site will be live at `https://christmassfun.store`
- HTTPS will be enabled with automatic certificate renewal
- Your site will be blazing fast with Netlify's global CDN
- All purchases and email signups will work seamlessly

**Don't forget to:**
- Update Stripe webhook URLs to production domain
- Test all payment flows thoroughly
- Monitor Netlify analytics and function logs
- Share your beautiful Christmas site! 🎄
