import { createClient } from '@supabase/supabase-js';

// Hard fallback URL so the app can still build even if env injection breaks.
// (This is safe to include publicly.)
const FALLBACK_SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_URL;

// IMPORTANT: This must come from VITE_SUPABASE_ANON_KEY in Bolt secrets.
// Do not hardcode it here.
export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

// Create a client even if the key is missing so imports don’t crash the app.
// Your UI should detect missing key and show an error.
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY || 'missing-anon-key'
);
