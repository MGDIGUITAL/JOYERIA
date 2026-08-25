import { createClient } from '@supabase/supabase-js';

// ─── Server-only Client (service_role key — NEVER expose to browser) ─────
// This client bypasses RLS and should only be used in Server Actions / API routes.
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qrhspijmfimjxemravyz.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
