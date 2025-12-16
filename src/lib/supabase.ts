import { createClient } from '@supabase/supabase-js';

// Vite can ONLY read env vars that start with VITE_
const FALLBACK_SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

// Create client even if missing key so imports do not crash.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'missing-anon-key');
