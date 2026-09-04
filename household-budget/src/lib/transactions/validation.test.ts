import { describe, expect, it } from "vitest";
import { parseDraft } from "./validation";

describe("parseDraft", () => {
  it("種別・発生日・1円以上の整数円を受け入れる", () => {
    const result = parseDraft({
      type: "income",
      amountYen: 1,
      occurredOn: "2026-09-04",
      memo: "  ",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        type: "income",
        amountYen: 1,
        occurredOn: "2026-09-04",
        memo: null,
      },
    });
  });

  it("種別または発生日の欠落はフィールド誤りになる", () => {
    const missingType = parseDraft({
      amountYen: 100,
      occurredOn: "2026-09-04",
    });
    const missingDate = parseDraft({
      type: "expense",
      amountYen: 100,
    });

    expect(missingType.ok).toBe(false);
    if (!missingType.ok) {
      expect(missingType.error.fields.type).toBeDefined();
    }
    expect(missingDate.ok).toBe(false);
    if (!missingDate.ok) {
      expect(missingDate.error.fields.occurredOn).toBeDefined();
    }
  });

  it("金額の未入力・0以下・非整数では保存せずフィールド誤りになる", () => {
    const cases = [
      {},
      { type: "expense", occurredOn: "2026-09-04" },
      { type: "expense", occurredOn: "2026-09-04", amountYen: 0 },
      { type: "expense", occurredOn: "2026-09-04", amountYen: -1 },
      { type: "expense", occurredOn: "2026-09-04", amountYen: 1.5 },
    ];

    for (const input of cases) {
      const result = parseDraft(input);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.fields.amountYen).toBeDefined();
      }
    }
  });
});
