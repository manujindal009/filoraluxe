import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  if (typeof window === 'undefined') {
    console.warn("Supabase Admin: URL or Service Role Key is missing. Server-side operations requiring RLS bypass will fail.");
  }
}

/**
 * Supabase client initialized with the Service Role key.
 * ⚠️ WARNING: Never use this on the client side.
 * This client bypasses Row Level Security (RLS).
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
