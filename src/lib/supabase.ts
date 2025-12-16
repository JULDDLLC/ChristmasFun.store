// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Frontend (Vite) can ONLY read env vars that start with VITE_
const FALLBACK_SUPABASE_URL = "https://kvnbgubooykiveogifwt.supabase.co";

// ✅ Put your REAL anon key here as a fallback.
// This is SAFE to expose in the browser (it is meant to be public).
// Get it from Supabase Dashboard → Project Settings → API → anon public key.
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmJndWJvb3lraXZlb2dpZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzg4OTUsImV4cCI6MjA4MDYxNDg5NX0.mJLw-MZSPVJEXc23EM8hrueTOXDhjsu9VRrifqKVBBo";

export const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_URL;

export const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  FALLBACK_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmJndWJvb3lraXZlb2dpZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzg4OTUsImV4cCI6MjA4MDYxNDg5NX0.mJLw-MZSPVJEXc23EM8hrueTOXDhjsu9VRrifqKVBBo") {
  // Only warns; does not crash the app.
  console.warn("Supabase env missing or fallback not set:", {
    VITE_SUPABASE_URL: !!(import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim(),
    VITE_SUPABASE_ANON_KEY: !!(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim(),
    usingFallbackUrl: SUPABASE_URL === FALLBACK_SUPABASE_URL,
    usingFallbackKey:
      SUPABASE_ANON_KEY === FALLBACK_SUPABASE_ANON_KEY ||
      SUPABASE_ANON_KEY === "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmJndWJvb3lraXZlb2dpZnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzg4OTUsImV4cCI6MjA4MDYxNDg5NX0.mJLw-MZSPVJEXc23EM8hrueTOXDhjsu9VRrifqKVBBo",
  });
}

// Create ONE client, always with a real key (env or fallback)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
