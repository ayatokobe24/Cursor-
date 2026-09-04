import { describe, expect, it } from "vitest";
import {
  signInWithPassword,
  signOutSession,
  signUpWithPassword,
  type PasswordAuthClient,
} from "./service";

function client(
  auth: Partial<PasswordAuthClient["auth"]>,
): PasswordAuthClient {
  return {
    auth: {
      signInWithPassword: async () => ({
        data: { session: null, user: null },
        error: { message: "unused" },
      }),
      signUp: async () => ({
        data: { session: null, user: null },
        error: { message: "unused" },
      }),
      signOut: async () => ({ error: null }),
      ...auth,
    },
  };
}

describe("signInWithPassword", () => {
  it("誤った認証情報では家計へ進めない", async () => {
    const result = await signInWithPassword(
      client({
        signInWithPassword: async () => ({
          data: { session: null, user: null },
          error: { message: "Invalid login credentials", code: "invalid_credentials" },
        }),
      }),
      "a@example.com",
      "wrong",
    );

    expect(result).toEqual({ ok: false, error: { kind: "invalidCredentials" } });
  });

  it("成功すると家計へ進める", async () => {
    const result = await signInWithPassword(
      client({
        signInWithPassword: async () => ({
          data: {
            session: { access_token: "t" },
            user: { id: "user-1" },
          },
          error: null,
        }),
      }),
      "a@example.com",
      "password",
    );

    expect(result).toEqual({ ok: true, value: { redirectTo: "/" } });
  });
});

describe("signUpWithPassword", () => {
  it("セッションが立たない登録では家計を出さない", async () => {
    const result = await signUpWithPassword(
      client({
        signUp: async () => ({
          data: { session: null, user: { id: "user-1" } },
          error: null,
        }),
      }),
      "a@example.com",
      "password",
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("unavailable");
    }
  });

  it("セッション付きの登録は家計へ進める", async () => {
    const result = await signUpWithPassword(
      client({
        signUp: async () => ({
          data: {
            session: { access_token: "t" },
            user: { id: "user-1" },
          },
          error: null,
        }),
      }),
      "a@example.com",
      "password",
    );

    expect(result).toEqual({ ok: true, value: { redirectTo: "/" } });
  });
});

describe("signOutSession", () => {
  it("ログアウト後はログインへ進める", async () => {
    const result = await signOutSession(
      client({
        signOut: async () => ({ error: null }),
      }),
    );

    expect(result).toEqual({ ok: true, value: { redirectTo: "/login" } });
  });
});
