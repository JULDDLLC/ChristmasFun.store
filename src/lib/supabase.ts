import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';

// Paste your Bolt VITE_SUPABASE_ANON_KEY value here.
// This is a public anon key (safe to ship). Do NOT use the service role key here.
const SUPABASE_ANON_KEY = 'PASTE_ANON_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
