import { describe, expect, it } from "vitest";
import { currentMonthId, fromMonthId, resolveMonthId, shiftMonthId } from "./month";

describe("fromMonthId", () => {
  it("対象月の開始日と翌月開始日を半開区間で返す", () => {
    expect(fromMonthId("2026-09")).toEqual({
      startDate: "2026-09-01",
      nextStartDate: "2026-10-01",
    });
    expect(fromMonthId("2026-12")).toEqual({
      startDate: "2026-12-01",
      nextStartDate: "2027-01-01",
    });
  });
});

describe("currentMonthId", () => {
  it("与えた日時の暦月を YYYY-MM で返す", () => {
    expect(currentMonthId(new Date(2026, 8, 4))).toBe("2026-09");
  });
});

describe("resolveMonthId", () => {
  it("未指定または不正な月は当月に倒す", () => {
    const now = new Date(2026, 8, 4);
    expect(resolveMonthId(null, now)).toBe("2026-09");
    expect(resolveMonthId("not-a-month", now)).toBe("2026-09");
    expect(resolveMonthId("2026-13", now)).toBe("2026-09");
    expect(resolveMonthId("2026-01", now)).toBe("2026-01");
  });
});

describe("shiftMonthId", () => {
  it("前月と翌月の対象月識別子を返す", () => {
    expect(shiftMonthId("2026-09", -1)).toBe("2026-08");
    expect(shiftMonthId("2026-09", 1)).toBe("2026-10");
    expect(shiftMonthId("2026-01", -1)).toBe("2025-12");
  });
});
