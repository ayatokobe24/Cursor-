import { describe, expect, it } from "vitest";
import { draftFromFormData } from "./form-values";

describe("draftFromFormData", () => {
  it("金額を整数円として読みメモを含める", () => {
    const form = new FormData();
    form.set("type", "expense");
    form.set("amountYen", "1200");
    form.set("occurredOn", "2026-09-04");
    form.set("memo", "昼食");

    expect(draftFromFormData(form)).toEqual({
      type: "expense",
      amountYen: 1200,
      occurredOn: "2026-09-04",
      memo: "昼食",
    });
  });
});
