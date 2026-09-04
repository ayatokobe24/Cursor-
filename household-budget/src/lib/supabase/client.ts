import { createBrowserClient } from "@supabase/ssr";
import { readSupabasePublicEnv } from "./config";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = readSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
