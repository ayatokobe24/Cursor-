import { describe, expect, it } from "vitest";
import type { Transaction } from "./types";
import { summarize } from "./summary";

function tx(
  type: Transaction["type"],
  amountYen: number,
): Transaction {
  return {
    id: "id",
    userId: "user",
    type,
    amountYen,
    occurredOn: "2026-09-01",
    memo: null,
  };
}

describe("summarize", () => {
  it("0件なら収入・支出・差引は0円", () => {
    expect(summarize([])).toEqual({
      incomeTotalYen: 0,
      expenseTotalYen: 0,
      netYen: 0,
    });
  });

  it("同じ行集合から収入合計・支出合計・差引を出す", () => {
    const items = [tx("income", 5000), tx("expense", 1200), tx("expense", 300)];
    expect(summarize(items)).toEqual({
      incomeTotalYen: 5000,
      expenseTotalYen: 1500,
      netYen: 3500,
    });
  });
});
