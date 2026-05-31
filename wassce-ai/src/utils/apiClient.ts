import { supabase } from "./supabase";

/** Returns the current Supabase access token, or null if not signed in. */
export const getAccessToken = async (): Promise<string | null> => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

/**
 * fetch wrapper that attaches the Supabase bearer token so protected API
 * endpoints can verify the user server-side. The browser never sends a user id
 * directly — identity is always derived from this verified token.
 */
export const authedFetch = async (input: string, init: RequestInit = {}): Promise<Response> => {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
};
