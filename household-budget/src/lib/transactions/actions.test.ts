import { describe, expect, it, vi } from "vitest";
import { ok } from "@/lib/result";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "./actions";
import type { Transaction } from "./types";

const saved: Transaction = {
  id: "tx-1",
  userId: "user-1",
  type: "expense",
  amountYen: 1200,
  occurredOn: "2026-09-04",
  memo: "昼食",
};

const draftInput = {
  type: "expense",
  amountYen: 1200,
  occurredOn: "2026-09-04",
  memo: "昼食",
};

describe("createTransaction", () => {
  it("未ログインでは保存しない", async () => {
    const insert = vi.fn();
    const result = await createTransaction(draftInput, {
      requireUser: async () => ({
        ok: false,
        error: { kind: "unauthenticated" },
      }),
      insert,
      revalidateHome: vi.fn(),
    });

    expect(result).toEqual({
      ok: false,
      error: { kind: "unauthenticated" },
    });
    expect(insert).not.toHaveBeenCalled();
  });

  it("検証失敗では保存しない", async () => {
    const insert = vi.fn();
    const result = await createTransaction(
      { type: "expense", occurredOn: "2026-09-04" },
      {
        requireUser: async () =>
          ok({ userId: "user-1", email: "a@example.com" }),
        insert,
        revalidateHome: vi.fn(),
      },
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("validation");
    }
    expect(insert).not.toHaveBeenCalled();
  });

  it("検証済みの下書きをセッション利用者として保存する", async () => {
    const insert = vi.fn(async () => ok(saved));
    const revalidateHome = vi.fn();
    const result = await createTransaction(
      { ...draftInput, userId: "attacker" },
      {
        requireUser: async () =>
          ok({ userId: "user-1", email: "a@example.com" }),
        insert,
        revalidateHome,
      },
    );

    expect(insert).toHaveBeenCalledWith("user-1", {
      type: "expense",
      amountYen: 1200,
      occurredOn: "2026-09-04",
      memo: "昼食",
    });
    expect(result).toEqual({ ok: true, value: { id: "tx-1" } });
    expect(revalidateHome).toHaveBeenCalled();
  });
});

describe("updateTransaction", () => {
  it("検証失敗では更新しない", async () => {
    const update = vi.fn();
    const result = await updateTransaction("tx-1", { type: "expense" }, {
      requireUser: async () =>
        ok({ userId: "user-1", email: "a@example.com" }),
      update,
      revalidateHome: vi.fn(),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("validation");
    }
    expect(update).not.toHaveBeenCalled();
  });
});

describe("deleteTransaction", () => {
  it("確認が無いときは削除しない", async () => {
    const remove = vi.fn();
    const result = await deleteTransaction("tx-1", false, {
      requireUser: async () =>
        ok({ userId: "user-1", email: "a@example.com" }),
      remove,
      revalidateHome: vi.fn(),
    });

    expect(result).toEqual({ ok: true, value: undefined });
    expect(remove).not.toHaveBeenCalled();
  });

  it("確認後に自分の記録を削除する", async () => {
    const remove = vi.fn(async () => ok(undefined));
    const revalidateHome = vi.fn();
    const result = await deleteTransaction("tx-1", true, {
      requireUser: async () =>
        ok({ userId: "user-1", email: "a@example.com" }),
      remove,
      revalidateHome,
    });

    expect(remove).toHaveBeenCalledWith("user-1", "tx-1");
    expect(result).toEqual({ ok: true, value: undefined });
    expect(revalidateHome).toHaveBeenCalled();
  });
});
