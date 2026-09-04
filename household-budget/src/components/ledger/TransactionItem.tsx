"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { formatYen } from "@/lib/money";
import { draftFromFormData } from "@/lib/transactions/form-values";
import type { Result } from "@/lib/result";
import type { AppError, Transaction, TransactionDraft } from "@/lib/transactions/types";
import {
  TransactionFields,
  actionErrorMessage,
} from "./TransactionFields";

type TransactionItemProps = {
  item: Transaction;
  updateTransaction: (
    id: string,
    draft: TransactionDraft,
  ) => Promise<Result<{ id: string }, AppError>>;
  deleteTransaction: (
    id: string,
    confirmed: boolean,
  ) => Promise<Result<void, AppError>>;
};

const TYPE_LABEL = {
  income: "収入",
  expense: "支出",
} as const;

export function TransactionItem({
  item,
  updateTransaction,
  deleteTransaction,
}: TransactionItemProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = draftFromFormData(new FormData(event.currentTarget));

    startTransition(async () => {
      const result = await updateTransaction(item.id, draft);
      if (!result.ok) {
        if (result.error.kind === "validation") {
          setFieldErrors(result.error.fields);
          setMessage(null);
          return;
        }
        setFieldErrors({});
        setMessage(actionErrorMessage(result.error));
        return;
      }
      setFieldErrors({});
      setMessage(null);
      setEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm("この記録を削除しますか？");
    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      const result = await deleteTransaction(item.id, true);
      if (!result.ok) {
        setMessage(actionErrorMessage(result.error));
        return;
      }
      router.refresh();
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">
          {TYPE_LABEL[item.type]}
          <span className="ml-3">{formatYen(item.amountYen)}</span>
        </p>
        <p className="text-sm text-zinc-600">{item.occurredOn}</p>
      </div>
      {item.memo ? <p>{item.memo}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          className="rounded-md border border-zinc-300 px-3 py-1 text-sm"
        >
          編集
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-md border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50"
        >
          削除
        </button>
      </div>
      {message ? (
        <p role="alert" className="text-sm text-zinc-600">
          {message}
        </p>
      ) : null}
      {editing ? (
        <form
          aria-label="記録を編集"
          onSubmit={handleUpdate}
          className="flex flex-col gap-3"
        >
          <TransactionFields
            idPrefix={`edit-${item.id}`}
            defaults={item}
            fieldErrors={fieldErrors}
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            変更を保存
          </button>
        </form>
      ) : null}
    </li>
  );
}
