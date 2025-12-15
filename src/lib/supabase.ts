import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';

// Paste your anon key between the quotes (no extra spaces, no newlines)
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmJndWJvb3lraXZlb2dpZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzg4OTUsImV4cCI6MjA4MDYxNDg5NX0.mJLw-MZSPVJEXc23EM8hrueTOXDhjsu9VRrifqKVBBo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);