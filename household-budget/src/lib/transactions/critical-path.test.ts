import { describe, expect, it, vi } from "vitest";
import { ok } from "@/lib/result";
import { summarize } from "./summary";
import {
  createTransaction,
  deleteTransaction,
} from "./actions";
import type { Transaction, TransactionDraft } from "./types";

describe("記録から要約までの流れ", () => {
  it("ログイン後に支出を残すと要約が更新され確認後の削除で消える", async () => {
    const rows: Transaction[] = [];
    const requireUser = async () =>
      ok({ userId: "user-1", email: "a@example.com" });
    const revalidateHome = vi.fn();

    const insert = async (userId: string, draft: TransactionDraft) => {
      const saved: Transaction = {
        id: "tx-1",
        userId,
        ...draft,
      };
      rows.push(saved);
      return ok(saved);
    };

    const remove = async (_userId: string, id: string) => {
      const index = rows.findIndex((row) => row.id === id);
      if (index >= 0) {
        rows.splice(index, 1);
      }
      return ok(undefined);
    };

    const created = await createTransaction(
      {
        type: "expense",
        amountYen: 1200,
        occurredOn: "2026-09-04",
        memo: "昼食",
      },
      { requireUser, insert, revalidateHome },
    );

    expect(created).toEqual({ ok: true, value: { id: "tx-1" } });
    expect(summarize(rows)).toEqual({
      incomeTotalYen: 0,
      expenseTotalYen: 1200,
      netYen: -1200,
    });

    await deleteTransaction("tx-1", false, { requireUser, remove, revalidateHome });
    expect(rows).toHaveLength(1);
    expect(summarize(rows).expenseTotalYen).toBe(1200);

    await deleteTransaction("tx-1", true, { requireUser, remove, revalidateHome });
    expect(rows).toHaveLength(0);
    expect(summarize(rows)).toEqual({
      incomeTotalYen: 0,
      expenseTotalYen: 0,
      netYen: 0,
    });
  });
});
