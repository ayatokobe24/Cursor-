import type { TransactionDraft, TransactionType } from "./types";

export function draftFromFormData(form: FormData): TransactionDraft {
  const typeRaw = String(form.get("type") ?? "");
  const memoRaw = String(form.get("memo") ?? "").trim();

  return {
    type: typeRaw as TransactionType,
    amountYen: Number(form.get("amountYen")),
    occurredOn: String(form.get("occurredOn") ?? ""),
    memo: memoRaw === "" ? null : memoRaw,
  };
}
