import { createClient } from '@supabase/supabase-js';

// Bolt-managed Supabase URL fallback is OK.
// The ANON key has NO safe fallback.
const FALLBACK_SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_URL;

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

if (!supabaseAnonKey) {
  // This is the error you were seeing in the UI
  console.error(
    'Missing VITE_SUPABASE_ANON_KEY in the deployed build. Republish with env vars set.'
  );
  throw new Error('Missing VITE_SUPABASE_ANON_KEY in the deployed build.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

