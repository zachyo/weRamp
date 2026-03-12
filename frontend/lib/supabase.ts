/**
 * Supabase Client — sBTC On-Ramp Aggregator
 *
 * Server-side Supabase client using the service role key.
 * Used by API routes for waitlist operations.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    "⚠️ Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). " +
      "Waitlist will fall back to local JSON file.",
  );
}

/**
 * Server-side Supabase client.
 * Returns null if env vars are not configured (graceful degradation).
 */
export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) return null;

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });
}
