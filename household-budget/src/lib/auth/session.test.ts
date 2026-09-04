import { describe, expect, it } from "vitest";
import { requireUserFromGetUser, toSessionUser } from "./session";

describe("toSessionUser", () => {
  it("識別子とメールだけを残し資格情報を捨てる", () => {
    const raw = {
      id: "user-1",
      email: "a@example.com",
      password: "secret",
      refresh_token: "refresh",
    };
    const user = toSessionUser(raw);

    expect(user).toEqual({ userId: "user-1", email: "a@example.com" });
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("refresh_token");
  });
});

describe("requireUserFromGetUser", () => {
  it("利用者が確定できないときは認証エラーにする", async () => {
    const result = await requireUserFromGetUser(async () => ({
      data: { user: null },
      error: null,
    }));

    expect(result).toEqual({ ok: false, error: { kind: "unauthenticated" } });
  });

  it("getUser の利用者をセッション利用者として返す", async () => {
    const result = await requireUserFromGetUser(async () => ({
      data: {
        user: { id: "user-1", email: "a@example.com" },
      },
      error: null,
    }));

    expect(result).toEqual({
      ok: true,
      value: { userId: "user-1", email: "a@example.com" },
    });
  });
});
