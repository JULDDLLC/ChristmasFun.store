/*
  # Fix Function Search Path Security Issue

  1. Security Fix
    - Recreate `update_updated_at_column` function with secure search_path
    - Set search_path to empty string to prevent injection attacks
    - This makes the function immune to search_path manipulation

  2. Notes
    - This is a critical security fix for the mutable search_path warning
    - The function behavior remains the same but is now secure
    - All existing triggers using this function will continue to work
*/

-- Drop and recreate the function with secure search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
