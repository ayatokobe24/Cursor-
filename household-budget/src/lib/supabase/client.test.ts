import { afterEach, describe, expect, it, vi } from "vitest";

const createBrowserClient = vi.fn((_url: string, _anonKey: string) => ({
  kind: "browser",
}));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: (...args: [string, string]) => createBrowserClient(...args),
}));

describe("createBrowserSupabaseClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    createBrowserClient.mockClear();
  });

  it("公開の接続先と anon キーだけでブラウザクライアントを作る", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-public");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "secret-role");

    const { createBrowserSupabaseClient } = await import("./client");
    createBrowserSupabaseClient();

    expect(createBrowserClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-public",
    );
    expect(createBrowserClient.mock.calls[0]).toHaveLength(2);
  });
});
