import { createClient } from '@supabase/supabase-js';

// Bolt-managed Supabase URL
const FALLBACK_SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';

// IMPORTANT:
// The anon key is public. It is safe to include as a fallback.
// Do NOT ever put the service role key in frontend code.
const FALLBACK_SUPABASE_ANON_KEY = ''; // <-- paste your VITE_SUPABASE_ANON_KEY value here

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_URL;

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error(
    'Missing Supabase anon key. Set VITE_SUPABASE_ANON_KEY in the deployed build (or provide FALLBACK_SUPABASE_ANON_KEY).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
