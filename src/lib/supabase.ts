import { createClient } from '@supabase/supabase-js';

// Bolt/Vite injects VITE_* at build time when it works.
// We still provide safe fallbacks so the build never bricks.
const FALLBACK_SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';

// Export these so components can import them instead of using import.meta.env everywhere.
export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_URL;

// If Bolt fails to inject this, it may be empty at runtime.
// We do NOT throw here because throwing crashes the whole app and can break deploys.
export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

// Create client even if key is empty, so imports don’t explode.
// Your UI should handle the missing key by showing an error instead of crashing the site.
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY || 'missing-anon-key'
);
