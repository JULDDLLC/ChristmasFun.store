import { createClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = ''; // paste anon key here if Bolt refuses to inject

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
