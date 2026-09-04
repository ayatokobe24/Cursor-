"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import type { AuthError } from "@/lib/auth/types";
import type { Result } from "@/lib/result";
import type {
  AppError,
  MonthId,
  MonthSummaryView,
  Transaction,
  TransactionDraft,
} from "@/lib/transactions/types";
import { LedgerSummary } from "./LedgerSummary";
import { MonthSwitcher } from "./MonthSwitcher";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";

type LedgerHomeProps = {
  monthId: MonthId;
  summary: MonthSummaryView | null;
  items: Transaction[];
  loadError?: string | null;
  saveTransaction: (
    draft: TransactionDraft,
  ) => Promise<Result<{ id: string }, AppError>>;
  updateTransaction: (
    id: string,
    draft: TransactionDraft,
  ) => Promise<Result<{ id: string }, AppError>>;
  deleteTransaction: (
    id: string,
    confirmed: boolean,
  ) => Promise<Result<void, AppError>>;
  signOut: () => Promise<Result<{ redirectTo: "/login" }, AuthError>>;
};

export function LedgerHome({
  monthId,
  summary,
  items,
  loadError = null,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  signOut,
}: LedgerHomeProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">家計</h1>
        <LogoutButton signOut={signOut} />
      </div>
      {loadError ? (
        <p role="alert" className="text-sm text-zinc-600 dark:text-zinc-400">
          {loadError}
        </p>
      ) : null}
      <MonthSwitcher monthId={monthId} />
      <LedgerSummary summary={summary} />
      <TransactionForm monthId={monthId} saveTransaction={saveTransaction} />
      <TransactionList
        items={items}
        loadFailed={Boolean(loadError)}
        updateTransaction={updateTransaction}
        deleteTransaction={deleteTransaction}
      />
    </main>
  );
}
