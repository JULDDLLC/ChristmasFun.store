import { createClient } from '@supabase/supabase-js';

// Fallback is ok for URL. Key should come from env/secrets.
const FALLBACK_SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';

// Vite only exposes variables prefixed with VITE_*.
// Bolt "Secrets" may be saved without VITE_ though, so we try both.
const env = (import.meta as any).env ?? {};

export const SUPABASE_URL: string =
  (env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  (env.SUPABASE_URL as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_URL;

export const SUPABASE_ANON_KEY: string =
  (env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  (env.SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  '';

export const supabase = createClient(
  SUPABASE_URL,
  // do NOT crash the app if the key is missing
  SUPABASE_ANON_KEY || 'missing-anon-key'
);
