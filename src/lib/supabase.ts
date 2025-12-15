import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';

// Paste your Bolt VITE_SUPABASE_ANON_KEY value here.
// This is a public anon key (safe to ship). Do NOT use the service role key here.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmJndWJvb3lraXZlb2dpZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzg4OTUsImV4cCI6MjA4MDYxNDg5NX0.mJLw-MZSPVJEXc23EM8hrueTOXDhjsu9VRrifqKVBBo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
