import { err, ok, type Result } from "@/lib/result";
import type { FieldErrors, TransactionDraft } from "./types";

const DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function parseDraft(input: unknown): Result<TransactionDraft, FieldErrors> {
  const fields: Record<string, string> = {};
  const record =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};

  const type = record.type;
  if (type !== "income" && type !== "expense") {
    fields.type = "種別を指定してください";
  }

  const occurredOn = record.occurredOn;
  if (typeof occurredOn !== "string" || !DATE.test(occurredOn)) {
    fields.occurredOn = "発生日を指定してください";
  }

  const amountYen = record.amountYen;
  if (
    typeof amountYen !== "number" ||
    !Number.isInteger(amountYen) ||
    amountYen < 1
  ) {
    fields.amountYen = "1円以上の整数を入力してください";
  }

  if (Object.keys(fields).length > 0) {
    return err({ fields });
  }

  const memoRaw = record.memo;
  const memo =
    typeof memoRaw === "string" && memoRaw.trim() !== ""
      ? memoRaw.trim()
      : null;

  return ok({
    type,
    amountYen,
    occurredOn,
    memo,
  } as TransactionDraft);
}
