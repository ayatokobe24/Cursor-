export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

export function readSupabasePublicEnv(
  env: Record<string, string | undefined> = process.env,
): SupabasePublicEnv {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL が未設定です");
  }

  if (!anonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定です");
  }

  return { url, anonKey };
}
