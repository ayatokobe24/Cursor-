import type { AppError, TransactionDraft } from "@/lib/transactions/types";

type TransactionFieldsProps = {
  idPrefix: string;
  defaults?: Partial<TransactionDraft>;
  fieldErrors?: Record<string, string>;
};

function nearbyError(fields: Record<string, string> | undefined, key: string) {
  const message = fields?.[key];
  if (!message) {
    return null;
  }
  return (
    <p role="alert" className="text-sm text-zinc-600 dark:text-zinc-400">
      {message}
    </p>
  );
}

export function TransactionFields({
  idPrefix,
  defaults,
  fieldErrors,
}: TransactionFieldsProps) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-type`} className="text-sm font-medium">
          種別
        </label>
        <select
          id={`${idPrefix}-type`}
          name="type"
          defaultValue={defaults?.type ?? "expense"}
          className="h-12 rounded-lg border border-zinc-300 bg-transparent px-3"
        >
          <option value="income">収入</option>
          <option value="expense">支出</option>
        </select>
        {nearbyError(fieldErrors, "type")}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-amountYen`} className="text-sm font-medium">
          金額
        </label>
        <input
          id={`${idPrefix}-amountYen`}
          name="amountYen"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          defaultValue={defaults?.amountYen}
          className="h-12 rounded-lg border border-zinc-300 bg-transparent px-3"
        />
        {nearbyError(fieldErrors, "amountYen")}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-occurredOn`} className="text-sm font-medium">
          発生日
        </label>
        <input
          id={`${idPrefix}-occurredOn`}
          name="occurredOn"
          type="date"
          defaultValue={defaults?.occurredOn}
          className="h-12 rounded-lg border border-zinc-300 bg-transparent px-3"
        />
        {nearbyError(fieldErrors, "occurredOn")}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${idPrefix}-memo`} className="text-sm font-medium">
          メモ
        </label>
        <input
          id={`${idPrefix}-memo`}
          name="memo"
          type="text"
          defaultValue={defaults?.memo ?? ""}
          className="h-12 rounded-lg border border-zinc-300 bg-transparent px-3"
        />
        {nearbyError(fieldErrors, "memo")}
      </div>
    </>
  );
}

export function actionErrorMessage(error: AppError): string | null {
  if (error.kind === "unavailable") {
    return error.message;
  }
  if (error.kind === "notFound") {
    return "記録が見つかりません";
  }
  if (error.kind === "unauthenticated") {
    return "ログインが必要です";
  }
  return null;
}
