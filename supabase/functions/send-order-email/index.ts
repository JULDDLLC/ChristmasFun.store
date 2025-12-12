import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmailRequest {
  to: string;
  productName: string;
  productType: string;
  downloadLinks: string[];
  orderNumber: string;
}

function prettyFilenameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split('/').pop() || 'download';
    return decodeURIComponent(last);
  } catch {
    const last = url.split('/').pop() || 'download';
    return decodeURIComponent(last);
  }
}

function safeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: EmailRequest = await req.json();
    const { to, productName, productType, downloadLinks, orderNumber } = body;

    if (!to || !productName || !orderNumber) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const links = Array.isArray(downloadLinks) ? downloadLinks.filter(Boolean) : [];

    const hasLinks = links.length > 0;

    const buttonStyle = `
      display:inline-block;
      padding:14px 18px;
      border-radius:12px;
      background:#b91c1c;
      color:#ffffff !important;
      text-decoration:none;
      font-weight:700;
      font-size:14px;
      letter-spacing:0.2px;
    `;

    const secondaryButtonStyle = `
      display:inline-block;
      padding:12px 16px;
      border-radius:12px;
      background:#0f766e;
      color:#ffffff !important;
      text-decoration:none;
      font-weight:700;
      font-size:14px;
      letter-spacing:0.2px;
    `;

    const itemButtonsHtml = links
      .map((link, idx) => {
        const label = prettyFilenameFromUrl(link);
        return `
          <tr>
            <td style="padding:10px 0;">
              <div style="font-size:14px;color:#e5e7eb;margin-bottom:8px;">
                ${safeHtml(label)}
              </div>
              <a href="${link}" style="${secondaryButtonStyle}" target="_blank" rel="noopener">
                Download File ${idx + 1}
              </a>
              <div style="font-size:12px;color:#9ca3af;margin-top:6px;line-height:1.4;">
                If the button doesn’t auto-download, it will open the file. Then use “Download” or “Save As”.
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    const instructionsHtml = `
      <div style="background:#111827;border:1px solid #1f2937;border-radius:14px;padding:18px;margin-top:18px;">
        <div style="font-size:16px;color:#f9fafb;font-weight:800;margin-bottom:8px;">How to download</div>
        <ul style="margin:0;padding-left:18px;color:#d1d5db;font-size:13px;line-height:1.6;">
          <li><b>Desktop:</b> Click a download button. If it opens in a new tab, use the download icon or right-click “Save As”.</li>
          <li><b>iPhone/iPad:</b> Tap download. If it opens, tap Share → “Save to Files”.</li>
          <li><b>Android:</b> Tap download. If it opens, tap the download icon or menu → Download.</li>
          <li><b>Printing:</b> Print at 100% scale on 8.5" x 11". Cardstock looks best.</li>
        </ul>
      </div>
    `;

    const noLinksHtml = `
      <div style="background:#111827;border:1px solid #1f2937;border-radius:14px;padding:18px;margin-top:18px;">
        <div style="font-size:16px;color:#f9fafb;font-weight:800;margin-bottom:8px;">We’re preparing your downloads</div>
        <div style="color:#d1d5db;font-size:13px;line-height:1.6;">
          Your order is confirmed, but we didn’t receive download links for this order yet.
          Please reply to this email with your order number and we’ll send your files ASAP.
        </div>
      </div>
    `;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Christmas Magic Designs are Ready</title>
</head>
<body style="margin:0;padding:0;background:#0b1220;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" border="0" style="background:#0f172a;border-radius:18px;overflow:hidden;border:1px solid #1f2937;">
          <tr>
            <td style="padding:28px 26px;background:linear-gradient(135deg,#7f1d1d 0%,#14532d 50%,#7f1d1d 100%);">
              <div style="color:#fff;font-size:26px;font-weight:900;line-height:1.2;">Christmas Magic Designs</div>
              <div style="color:#fef3c7;font-size:14px;margin-top:8px;line-height:1.4;">Your order is ready!</div>
            </td>
          </tr>

          <tr>
            <td style="padding:26px;">
              <div style="color:#e5e7eb;font-size:14px;line-height:1.7;">
                Thank you for your purchase! Your designs are ready to download and print.
              </div>

              <div style="margin-top:18px;background:#052e1a;border-left:4px solid #16a34a;border-radius:12px;padding:14px;">
                <div style="color:#bbf7d0;font-weight:800;font-size:14px;margin-bottom:8px;">Order Details</div>
                <div style="color:#dcfce7;font-size:13px;line-height:1.6;">
                  <div><b>Product:</b> ${safeHtml(productName)}</div>
                  <div><b>Order Number:</b> ${safeHtml(orderNumber)}</div>
                  <div><b>Type:</b> ${safeHtml(productType || 'N/A')}</div>
                </div>
              </div>

              <div style="margin-top:22px;color:#f9fafb;font-size:18px;font-weight:900;">Your Downloads</div>

              ${
                hasLinks
                  ? `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
                      ${itemButtonsHtml}
                    </table>
                    ${instructionsHtml}
                  `
                  : noLinksHtml
              }

              <div style="margin-top:18px;color:#9ca3af;font-size:12px;line-height:1.6;">
                Need help? Email <a href="mailto:support@juldd.com" style="color:#34d399;text-decoration:none;">support@juldd.com</a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 26px;background:#0b1020;border-top:1px solid #1f2937;text-align:center;">
              <div style="color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} JULDD LLC</div>
              <div style="color:#6b7280;font-size:11px;margin-top:6px;">Made with love for magical holidays</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ChristmasMagicDesigns@juldd.com',
        to: [to],
        subject: `Your Christmas Magic Designs are Ready! 🎄`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Resend API error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();

    return new Response(JSON.stringify({ success: true, messageId: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
