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

    const {
      to,
      productName,
      productType,
      downloadLinks,
      orderNumber,
    }: EmailRequest = await req.json();

    if (!to || !productName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build nicer labels + button HTML per link
    const downloadButtonsHtml = downloadLinks
      .map((link, index) => {
        const filename = link.split('/').pop() ?? '';
        let label = `Download File ${index + 1}`;

        const designMatch = filename.match(/design[-_]?(\d+)/i);
        const noteMatch = filename.match(/ChristmasNotes?[-_]?(\d*)/i);
        const colorMatch = filename.match(/color(?:ing)?(?:sheet|page|pages)?[-_]?(\d*)/i);

        if (designMatch?.[1]) {
          label = `Download Design ${designMatch[1]}`;
        } else if (noteMatch) {
          const num = noteMatch[1] || `${index + 1}`;
          label = `Download Note ${num}`;
        } else if (colorMatch) {
          const num = colorMatch[1] || `${index + 1}`;
          label = `Download Coloring Page ${num}`;
        } else if (productType === 'teacher_license_499') {
          label = 'Download Teacher License';
        }

        return `
          <tr>
            <td align="center" style="padding: 6px 0;">
              <a
                href="${link}"
                style="
                  display: inline-block;
                  padding: 12px 24px;
                  border-radius: 999px;
                  background-color: #16a34a;
                  color: #ffffff;
                  text-decoration: none;
                  font-weight: 600;
                  font-size: 14px;
                  letter-spacing: 0.02em;
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
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f9fafb;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #7f1d1d 0%, #14532d 50%, #7f1d1d 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Christmas Magic Designs</h1>
                      <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 18px;">Your order is ready!</p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Thank you for your purchase! Your magical Christmas designs are ready to download and print.
                      </p>
                      
                      <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 8px;">
                        <p style="color: #15803d; margin: 0 0 10px 0; font-weight: bold;">Order Details:</p>
                        <p style="color: #166534; margin: 5px 0; font-size: 14px;"><strong>Product:</strong> ${productName}</p>
                        <p style="color: #166534; margin: 5px 0; font-size: 14px;"><strong>Order Number:</strong> ${orderNumber}</p>
                      </div>

                      <h2 style="color: #1f2937; font-size: 20px; margin: 30px 0 15px 0;">Download Your Designs:</h2>

                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 30px 0;">
                        ${downloadButtonsHtml}
                      </table>

                      <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #78350f; font-size: 16px; margin: 0 0 10px 0;">Printing Tips:</h3>
                        <ul style="color: #92400e; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                          <li>Print on white cardstock for best results</li>
                          <li>Use high-quality printer settings</li>
                          <li>Standard 8.5&quot; x 11&quot; paper size</li>
                          <li>Save your files for future use</li>
                        </ul>
                      </div>

                      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                        If you have any questions or need assistance, please contact us at
                        <a href="mailto:support@juldd.com" style="color: #16a34a; text-decoration: none;">support@juldd.com</a>
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 14px; margin: 0;">© 2024 Christmas Magic Designs by JULDD</p>
                      <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">Made with love for magical holidays</p>
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
