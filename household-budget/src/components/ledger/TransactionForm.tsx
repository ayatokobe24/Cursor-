"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { draftFromFormData } from "@/lib/transactions/form-values";
import type { Result } from "@/lib/result";
import type { AppError, TransactionDraft } from "@/lib/transactions/types";
import {
  TransactionFields,
  actionErrorMessage,
} from "./TransactionFields";

type TransactionFormProps = {
  monthId: string;
  saveTransaction: (
    draft: TransactionDraft,
  ) => Promise<Result<{ id: string }, AppError>>;
};

export function TransactionForm({ monthId, saveTransaction }: TransactionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft = draftFromFormData(new FormData(event.currentTarget));
    const form = event.currentTarget;

    startTransition(async () => {
      const result = await saveTransaction(draft);
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
      form.reset();
      router.refresh();
    });
  }

  return (
    <form
      id="add-transaction"
      aria-label="記録を追加"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-4"
    >
      <h2 className="text-lg font-semibold">記録を追加</h2>
      <TransactionFields
        idPrefix="create"
        defaults={{ occurredOn: `${monthId}-01`, type: "expense" }}
        fieldErrors={fieldErrors}
      />
      {message ? (
        <p role="alert" className="text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="h-12 rounded-lg bg-zinc-900 px-4 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        記録を追加
      </button>
    </form>
  );
}
