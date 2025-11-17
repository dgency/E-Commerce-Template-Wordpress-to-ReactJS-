import { FUNCTIONS_BASE_URL, SUPABASE_ANON_KEY, assertSupabaseEnv } from "@/config/runtime";

export function functionsUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${FUNCTIONS_BASE_URL}${p}`;
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...(extra || {}),
  };
}

export async function functionsFetch(path: string, init?: RequestInit) {
  assertSupabaseEnv();
  const url = functionsUrl(path);
  const headers = authHeaders(init?.headers);
  return fetch(url, { ...init, headers });
}
