import type { Result } from "@/lib/result";
import type { AppError, Transaction, TransactionDraft } from "@/lib/transactions/types";
import { TransactionItem } from "./TransactionItem";

type TransactionListProps = {
  items: Transaction[];
  loadFailed?: boolean;
  updateTransaction: (
    id: string,
    draft: TransactionDraft,
  ) => Promise<Result<{ id: string }, AppError>>;
  deleteTransaction: (
    id: string,
    confirmed: boolean,
  ) => Promise<Result<void, AppError>>;
};

export function TransactionList({
  items,
  loadFailed = false,
  updateTransaction,
  deleteTransaction,
}: TransactionListProps) {
  return (
    <section aria-label="明細" className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">明細</h2>
      {items.length === 0 ? (
        loadFailed ? (
          <p>明細を表示できません</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p>この月の記録はまだありません</p>
            <a href="#add-transaction" className="font-medium underline">
              記録を追加する
            </a>
          </div>
        )
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <TransactionItem
              key={item.id}
              item={item}
              updateTransaction={updateTransaction}
              deleteTransaction={deleteTransaction}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
