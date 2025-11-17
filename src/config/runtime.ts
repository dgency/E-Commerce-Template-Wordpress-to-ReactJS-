// Central runtime configuration for the frontend
// Change SUPABASE_URL and SUPABASE_ANON_KEY here to switch projects globally.
// Prefer .env for production builds; this file can override at runtime for quick swaps.

export const SUPABASE_URL: string = (globalThis as any)?.APP_CONFIG?.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY: string = (globalThis as any)?.APP_CONFIG?.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const FUNCTIONS_BASE_URL = `${SUPABASE_URL}/functions/v1`;

export function assertSupabaseEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY.');
  }
}
