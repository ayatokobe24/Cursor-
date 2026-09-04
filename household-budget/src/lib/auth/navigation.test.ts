import { describe, expect, it } from "vitest";
import { decideAuthNavigation } from "./navigation";

describe("decideAuthNavigation", () => {
  it("未認証の家計ルートはログインへ送り記録を出さない", () => {
    expect(decideAuthNavigation("/", null)).toEqual({
      action: "redirect",
      pathname: "/login",
    });
  });

  it("認証済みがログインまたは登録を開くと家計へ戻す", () => {
    const user = { id: "user-1" };
    expect(decideAuthNavigation("/login", user)).toEqual({
      action: "redirect",
      pathname: "/",
    });
    expect(decideAuthNavigation("/signup", user)).toEqual({
      action: "redirect",
      pathname: "/",
    });
  });

  it("未認証の認証画面と確認コールバックはそのまま通す", () => {
    expect(decideAuthNavigation("/login", null)).toEqual({ action: "next" });
    expect(decideAuthNavigation("/auth/callback", null)).toEqual({
      action: "next",
    });
  });
});
