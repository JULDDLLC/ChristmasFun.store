import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase URL for your Bolt-managed project.
export const SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';

// TODO: Paste your real VITE_SUPABASE_ANON_KEY value here (between the single quotes).
export const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmJndWJvb3lraXZlb2dpZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzg4OTUsImV4cCI6MjA4MDYxNDg5NX0.mJLw-MZSPVJEXc23EM8hrueTOXDhjsu9VRrifqKVBBo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

);
