import { describe, expect, it } from "vitest";
import type { AuthError, SessionUser } from "./auth/types";
import { err, ok } from "./result";
import type { Transaction } from "./transactions/types";

describe("Result", () => {
  it("成功は値を持ち失敗と区別できる", () => {
    const success = ok(1);
    const failure = err({ kind: "unavailable" as const, message: "down" });

    expect(success.ok).toBe(true);
    if (success.ok) {
      expect(success.value).toBe(1);
    }
    expect(failure.ok).toBe(false);
    if (!failure.ok) {
      expect(failure.error.kind).toBe("unavailable");
    }
  });
});

describe("共有の家計とセッション概念", () => {
  it("記録は種別・正の整数円・暦日・任意メモ・所有者を表す", () => {
    const transaction: Transaction = {
      id: "tx-1",
      userId: "user-1",
      type: "expense",
      amountYen: 1200,
      occurredOn: "2026-09-04",
      memo: "昼食",
    };

    expect(transaction.amountYen).toBe(1200);
    expect(Number.isInteger(transaction.amountYen)).toBe(true);
    expect(transaction.occurredOn).toBe("2026-09-04");
    expect(transaction.memo).toBe("昼食");
    expect(transaction.userId).toBe("user-1");
  });

  it("セッション利用者は識別子とメールだけを持ち資格情報を持たない", () => {
    const user: SessionUser = {
      userId: "user-1",
      email: "a@example.com",
    };

    expect(user.userId).toBe("user-1");
    expect(user.email).toBe("a@example.com");
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("refreshToken");
  });

  it("認証エラーは誤情報と利用不可を区別する", () => {
    const invalid: AuthError = { kind: "invalidCredentials" };
    const unavailable: AuthError = { kind: "unavailable", message: "confirm email" };

    expect(invalid.kind).toBe("invalidCredentials");
    expect(unavailable.kind).toBe("unavailable");
  });
});
