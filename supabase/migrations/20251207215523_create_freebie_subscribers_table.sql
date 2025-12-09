/*
  # Create freebie subscribers table

  1. New Tables
    - `freebie_subscribers`
      - `id` (uuid, primary key) - Unique identifier
      - `email` (text, unique) - Subscriber email address
      - `subscribed_at` (timestamptz) - When they subscribed
      - `sheets_sent` (boolean) - Whether coloring sheets were sent
      - `ip_address` (text) - Optional IP for rate limiting
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `freebie_subscribers` table
    - Add policy for service role to manage records
    - Prevent public read access to protect subscriber privacy

  3. Indexes
    - Index on email for fast lookups
    - Index on created_at for analytics
*/

-- Create freebie subscribers table
CREATE TABLE IF NOT EXISTS freebie_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  sheets_sent boolean DEFAULT false,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE freebie_subscribers ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_freebie_subscribers_email ON freebie_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_freebie_subscribers_created_at ON freebie_subscribers(created_at);

-- RLS Policies: Only service role can access (no public access for privacy)
CREATE POLICY "Service role can manage freebie subscribers"
  ON freebie_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
