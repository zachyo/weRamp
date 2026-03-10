-- sBTC On-Ramp Aggregator: Supabase Migration
-- Run this in your Supabase SQL Editor to create the waitlist table.

CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (Supabase best practice)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Only the service role can insert/read (no client-side access)
CREATE POLICY "Service role full access" ON waitlist
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast duplicate checks
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (email);
