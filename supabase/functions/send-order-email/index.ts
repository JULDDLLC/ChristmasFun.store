import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
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

function buildNiceLabel(productType: string, index: number, link: string): string {
  // You can tweak these labels anytime
  if (productType === 'single_letter_99') {
    return 'Download your Santa Letter';
  }

  if (productType === 'bundle_14_999' || productType === 'complete_bundle_999') {
    return `Download Santa Letter ${index + 1}`;
  }

  if (productType === 'notes_bundle_299') {
    return `Download Christmas Note ${index + 1}`;
  }

  if (productType === 'teacher_license_499') {
    return `Download Classroom Copy ${index + 1}`;
  }

  if (productType === 'coloring_bundle_free') {
    return `Download Coloring Page ${index + 1}`;
  }

  // Fallback: use a cleaned-up filename
  const rawName = link.split('/').pop() || `File ${index + 1}`;
  return `Download ${rawName.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[-_]+/g, ' ')}`;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { to, productName, productType, downloadLinks, orderNumber }: EmailRequest = await req.json();

    if (!to || !productName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const downloadLinksHtml =
      downloadLinks.length === 0
        ? `<p style="color:#b91c1c; font-size:14px;">
             We’re still preparing your files. If this message appears after a few minutes,
             please reply to this email and we’ll resend your download links manually.
           </p>`
        : downloadLinks
            .map((link, index) => {
              const label = buildNiceLabel(productType, index, link);
              const filename = link.split('/').pop() || `file-${index + 1}.png`;

              return `
                <tr>
                  <td align="center" style="padding-bottom: 10px;">
                    <a
                      href="${link}"
                      download="${filename}"
                      style="
                        display:inline-block;
                        padding: 12px 20px;
                        border-radius: 999px;
                        background: linear-gradient(135deg, #16a34a, #22c55e);
                        color:#ffffff;
                        text-decoration:none;
                        font-weight:600;
                        font-size:14px;
                      "
                    >
                      ${label}
                    </a>
                  </td>
                </tr>
              `;
            })
            .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Christmas Magic Designs are Ready!</title>
        </head>
        <body style="margin:0; padding:0; font-family: 'Arial', sans-serif; background-color:#0b1220;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0b1220; padding:40px 16px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background-color:#020617; border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.45); border:1px solid #1f2937;">
                  <tr>
                    <td style="background: radial-gradient(circle at top, #facc15, #7c2d12 40%, #020617 80%); padding:32px 24px; text-align:center;">
                      <h1 style="color:#f9fafb; margin:0; font-size:28px; font-weight:800; letter-spacing:0.04em;">
                        Christmas Magic Designs
                      </h1>
                      <p style="color:#fef9c3; margin:10px 0 0 0; font-size:16px;">
                        Your order is ready to download ✨
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding:32px 24px;">
                      <p style="color:#e5e7eb; font-size:15px; line-height:1.7; margin:0 0 20px 0;">
                        Thank you for your purchase! Your magical Christmas designs are ready to download and print.
                      </p>
                      
                      <div style="background-color:#022c22; border-left:4px solid #22c55e; padding:16px 18px; margin:20px 0 24px 0; border-radius:12px;">
                        <p style="color:#bbf7d0; margin:0 0 6px 0; font-weight:700; font-size:14px;">Order details</p>
                        <p style="color:#a7f3d0; margin:4px 0; font-size:13px;"><strong>Product:</strong> ${productName}</p>
                        <p style="color:#a7f3d0; margin:4px 0; font-size:13px;"><strong>Order number:</strong> ${orderNumber}</p>
                      </div>

                      <h2 style="color:#f9fafb; font-size:18px; margin:10px 0 10px 0;">Download your designs</h2>

                      <p style="color:#9ca3af; font-size:13px; margin:0 0 16px 0;">
                        Click the buttons below to download your files.
                        On desktop, you can also right-click a design and choose
                        <strong>"Save image as..."</strong> to save it to your computer.
                      </p>

                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px 0;">
                        ${downloadLinksHtml}
                      </table>

                      <div style="background-color:#fef3c7; border-radius:12px; padding:16px 18px; margin:12px 0 0 0;">
                        <h3 style="color:#92400e; font-size:14px; margin:0 0 8px 0;">Printing tips</h3>
                        <ul style="color:#b45309; font-size:13px; margin:0; padding-left:20px; line-height:1.6;">
                          <li>Print on white cardstock for best results.</li>
                          <li>Use high-quality printer settings.</li>
                          <li>Standard 8.5" × 11" paper size.</li>
                          <li>Save your files so you can re-print next year.</li>
                        </ul>
                      </div>

                      <p style="color:#6b7280; font-size:12px; line-height:1.6; margin:24px 0 0 0;">
                        If you have any questions or need assistance, just reply to this email
                        or contact us at
                        <a href="mailto:support@juldd.com" style="color:#22c55e; text-decoration:none;">support@juldd.com</a>.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color:#020617; padding:20px; text-align:center; border-top:1px solid #111827;">
                      <p style="color:#4b5563; font-size:11px; margin:0;">© 2024 Christmas Magic Designs by JULDD</p>
                      <p style="color:#4b5563; font-size:11px; margin:6px 0 0 0;">Made with love for magical holidays 🎄</p>
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
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await res.json();
    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data.id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
