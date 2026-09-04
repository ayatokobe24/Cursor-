import { describe, expect, it } from "vitest";
import { completeAuthCallback } from "./callback";

describe("completeAuthCallback", () => {
  it("コード交換に成功すると家計へ進む", async () => {
    const path = await completeAuthCallback("auth-code", async () => ({
      error: null,
    }));
    expect(path).toBe("/");
  });

  it("コードが無い、または交換失敗では家計データを返さずログインへ戻す", async () => {
    const missing = await completeAuthCallback(null, async () => ({
      error: null,
    }));
    const failed = await completeAuthCallback("auth-code", async () => ({
      error: { message: "invalid" },
    }));

    expect(missing).toBe("/login");
    expect(failed).toBe("/login");
  });
});
