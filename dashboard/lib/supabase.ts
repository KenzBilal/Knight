import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side Supabase client with auth (for API routes using cookies).
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component during render — safe to ignore
        }
      },
    },
  });
}

/**
 * Service-role Supabase client (bypasses RLS).
 * Use only in server-side API routes for privileged operations.
 */
export function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Browser-side Supabase client.
 */
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
