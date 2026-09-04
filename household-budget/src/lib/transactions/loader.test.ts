import { describe, expect, it, vi } from "vitest";
import { ok } from "@/lib/result";
import { loadLedger, presentLoadedLedger } from "./loader";
import type { Transaction } from "./types";

describe("loadLedger", () => {
  it("月未指定なら当月を使い0件でも要約は0円", async () => {
    const listByMonth = vi.fn(async () => ok([] as Transaction[]));
    const result = await loadLedger(null, new Date(2026, 8, 4), {
      requireUser: async () =>
        ok({ userId: "user-1", email: "a@example.com" }),
      listByMonth,
    });

    expect(listByMonth).toHaveBeenCalledWith("user-1", "2026-09");
    expect(result).toEqual({
      ok: true,
      value: {
        monthId: "2026-09",
        items: [],
        summary: { incomeTotalYen: 0, expenseTotalYen: 0, netYen: 0 },
      },
    });
  });

  it("利用者が確定できないときは一覧を読まない", async () => {
    const listByMonth = vi.fn();
    const result = await loadLedger("2026-01", new Date(), {
      requireUser: async () => ({
        ok: false,
        error: { kind: "unauthenticated" },
      }),
      listByMonth,
    });

    expect(result).toEqual({
      ok: false,
      error: { kind: "unauthenticated" },
    });
    expect(listByMonth).not.toHaveBeenCalled();
  });

  it("不正な月指定は当月に倒す", async () => {
    const listByMonth = vi.fn(async () => ok([] as Transaction[]));
    const result = await loadLedger("2026-13", new Date(2026, 8, 4), {
      requireUser: async () =>
        ok({ userId: "user-1", email: "a@example.com" }),
      listByMonth,
    });

    expect(listByMonth).toHaveBeenCalledWith("user-1", "2026-09");
    expect(result.ok && result.value.monthId).toBe("2026-09");
  });
});

describe("presentLoadedLedger", () => {
  it("取得失敗では0円を当月の実績にせず失敗理由を残す", () => {
    const presented = presentLoadedLedger(
      {
        ok: false,
        error: { kind: "unavailable", message: "記録を取得できませんでした" },
      },
      "2026-09",
    );

    expect(presented).toEqual({
      monthId: "2026-09",
      items: [],
      summary: null,
      loadError: "記録を取得できませんでした",
    });
  });

  it("成功時は行と要約をそのまま返す", () => {
    const presented = presentLoadedLedger(
      {
        ok: true,
        value: {
          monthId: "2026-09",
          items: [],
          summary: { incomeTotalYen: 0, expenseTotalYen: 0, netYen: 0 },
        },
      },
      "2026-01",
    );

    expect(presented.summary).toEqual({
      incomeTotalYen: 0,
      expenseTotalYen: 0,
      netYen: 0,
    });
    expect(presented.loadError).toBeNull();
    expect(presented.monthId).toBe("2026-09");
  });
});
