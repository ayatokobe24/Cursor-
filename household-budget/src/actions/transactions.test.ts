import { afterEach, describe, expect, it, vi } from "vitest";

const requireUser = vi.hoisted(() => vi.fn());
const from = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/auth/session", () => ({
  requireUser,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({ from }),
}));

import { create, removeRecord, updateRecord } from "./transactions";

const draft = {
  type: "expense",
  amountYen: 1200,
  occurredOn: "2026-09-04",
  memo: "昼食",
};

afterEach(() => {
  requireUser.mockReset();
  from.mockReset();
  revalidatePath.mockReset();
});

describe("記録の変更系サーバー操作", () => {
  it("未ログインでは保存も更新も削除もしない", async () => {
    requireUser.mockResolvedValue({
      ok: false,
      error: { kind: "unauthenticated" },
    });

    await expect(create(draft)).resolves.toEqual({
      ok: false,
      error: { kind: "unauthenticated" },
    });
    await expect(updateRecord("tx-1", draft)).resolves.toEqual({
      ok: false,
      error: { kind: "unauthenticated" },
    });
    await expect(removeRecord("tx-1", true)).resolves.toEqual({
      ok: false,
      error: { kind: "unauthenticated" },
    });

    expect(from).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("検証失敗では記録を変えない", async () => {
    requireUser.mockResolvedValue({
      ok: true,
      value: { userId: "user-1", email: "a@example.com" },
    });

    const result = await create({ type: "expense", occurredOn: "2026-09-04" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("validation");
    }
    expect(from).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("確認なし削除では記録が残る", async () => {
    requireUser.mockResolvedValue({
      ok: true,
      value: { userId: "user-1", email: "a@example.com" },
    });

    await expect(removeRecord("tx-1", false)).resolves.toEqual({
      ok: true,
      value: undefined,
    });
    expect(from).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
