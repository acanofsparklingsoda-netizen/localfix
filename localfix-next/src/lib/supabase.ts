import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabaseConfigured = !!url && !!anon && !/YOUR-/.test(url + anon);

let browserClient: SupabaseClient | null = null;

/** Shared browser client (persists the logged-in session). */
export function getSupabase(): SupabaseClient {
  if (!browserClient) browserClient = createClient(url, anon);
  return browserClient;
}

/**
 * Anonymous-only client that ignores any saved login — used by the public
 * "post a job" form so it always submits as the anon role (which the RLS
 * policies allow), even if an admin/worker happens to be logged in.
 */
export function getAnonSupabase(): SupabaseClient {
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
}
