import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  email: string;
  ip_address?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
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

    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, supabaseKey);

    const { email, ip_address }: RequestBody = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email address is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: existingSubscriber } = await supabase
      .from('freebie_subscribers')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingSubscriber) {
      return new Response(
        JSON.stringify({ 
          error: 'This email has already received the free coloring sheets',
          already_subscribed: true 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: subscriber, error: insertError } = await supabase
      .from('freebie_subscribers')
      .insert([{
        email: email.toLowerCase(),
        ip_address: ip_address || null,
        sheets_sent: false,
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting subscriber:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save subscription' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const downloadBase = `${SUPABASE_URL}/functions/v1/download-file`;

    const coloringSheets = [
      { name: 'Festive Patterns #1', id: 'kids-1', category: 'kids' },
      { name: 'Holiday Design #1', id: 'kids-2', category: 'kids' },
      { name: 'Winter Wonderland', id: 'kids-3', category: 'kids' },
      { name: 'Christmas Elegance', id: 'kids-4', category: 'kids' },
      { name: 'Holiday Magic', id: 'kids-5', category: 'kids' },
      { name: 'Intricate Mandala Wreath', id: 'adult-1', category: 'adult' },
      { name: 'Ornamental Tree', id: 'adult-2', category: 'adult' },
      { name: 'Victorian Street Scene', id: 'adult-3', category: 'adult' },
      { name: "Santa's Workshop", id: 'adult-4', category: 'adult' },
      { name: 'Gingerbread Cityscape', id: 'adult-5', category: 'adult' },
    ];

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f59e0b; font-size: 32px; margin-bottom: 10px;">Your Free Christmas Coloring Collection!</h1>
          <p style="color: #cbd5e1; font-size: 18px;">Thank you for downloading our beautiful coloring sheets</p>
        </div>

        <div style="background-color: #1e293b; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
          <h2 style="color: #f59e0b; font-size: 24px; margin-bottom: 15px;">Kids Coloring Sheets (5)</h2>
          <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 15px;">Click any button below to download and print!</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${coloringSheets.filter(s => s.category === 'kids').map(sheet => `
              <a href="${downloadBase}?file=${sheet.id}"
                 style="display: block; padding: 12px 20px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 500;">
                Download: ${sheet.name}
              </a>
            `).join('')}
          </div>
        </div>

        <div style="background-color: #1e293b; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
          <h2 style="color: #f59e0b; font-size: 24px; margin-bottom: 15px;">Intricate Adult Coloring Sheets (5)</h2>
          <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 15px;">Beautiful detailed designs perfect for relaxation!</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${coloringSheets.filter(s => s.category === 'adult').map(sheet => `
              <a href="${downloadBase}?file=${sheet.id}"
                 style="display: block; padding: 12px 20px; background-color: #16a34a; color: #ffffff; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 500;">
                Download: ${sheet.name}
              </a>
            `).join('')}
          </div>
        </div>

        <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
          <h3 style="color: #78350f; font-size: 16px; margin-top: 0; margin-bottom: 10px;">Printing Tips:</h3>
          <ul style="color: #92400e; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>Print on white cardstock for best results</li>
            <li>Use high-quality printer settings</li>
            <li>Standard 8.5" x 11" paper size</li>
            <li>Save your files for future use</li>
          </ul>
        </div>

        <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px;">
          <p>Happy Coloring!</p>
          <p>ChristmasMagicDesigns@juldd.com</p>
        </div>
      </div>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ChristmasMagicDesigns@juldd.com',
        to: [email],
        subject: 'Your Free Christmas Coloring Sheets are Ready!',
        html: emailBody,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error('Resend API error:', error);

      await supabase
        .from('freebie_subscribers')
        .delete()
        .eq('id', subscriber.id);

      return new Response(
        JSON.stringify({ error: 'Failed to send email. Please try again.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase
      .from('freebie_subscribers')
      .update({ sheets_sent: true })
      .eq('id', subscriber.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully subscribed! Check your email for download links.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-freebie-coloring function:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});