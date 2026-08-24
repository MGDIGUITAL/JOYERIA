import { createClient } from '@supabase/supabase-js';

// ─── Server-only Client (service_role key — NEVER expose to browser) ─────
// This client bypasses RLS and should only be used in Server Actions / API routes.
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
