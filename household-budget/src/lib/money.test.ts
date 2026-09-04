import { describe, expect, it } from "vitest";
import { formatYen } from "./money";

describe("formatYen", () => {
  it("一覧と要約で同じ日本円の通貨表示になる", () => {
    const expected = new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(1200);

    expect(formatYen(1200)).toBe(expected);
    expect(formatYen(0)).toBe(
      new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
      }).format(0),
    );
  });
});
