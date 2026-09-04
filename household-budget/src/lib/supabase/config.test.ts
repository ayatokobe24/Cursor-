import { describe, expect, it } from "vitest";
import { readSupabasePublicEnv } from "./config";

describe("readSupabasePublicEnv", () => {
  it("公開の接続先と anon キーだけを返す", () => {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-public-key",
      SUPABASE_SERVICE_ROLE_KEY: "must-not-be-read",
    };

    const config = readSupabasePublicEnv(env);

    expect(config).toEqual({
      url: "https://example.supabase.co",
      anonKey: "anon-public-key",
    });
    expect(config).not.toHaveProperty("serviceRoleKey");
  });

  it("公開設定が無いとクライアント用設定を作れない", () => {
    expect(() => readSupabasePublicEnv({})).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
    expect(() =>
      readSupabasePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  });
});
