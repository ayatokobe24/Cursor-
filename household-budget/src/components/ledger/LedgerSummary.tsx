import { formatYen } from "@/lib/money";
import type { MonthSummaryView } from "@/lib/transactions/types";

type LedgerSummaryProps = {
  summary: MonthSummaryView | null;
};

export function LedgerSummary({ summary }: LedgerSummaryProps) {
  return (
    <section aria-label="月次要約" className="rounded-xl border border-zinc-200 p-4">
      <h2 className="mb-3 text-lg font-semibold">月次要約</h2>
      {summary ? (
        <dl className="grid gap-2 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-zinc-600">収入合計</dt>
            <dd className="text-xl font-semibold">{formatYen(summary.incomeTotalYen)}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-600">支出合計</dt>
            <dd className="text-xl font-semibold">{formatYen(summary.expenseTotalYen)}</dd>
          </div>
          <div>
            <dt className="text-sm text-zinc-600">差引</dt>
            <dd className="text-xl font-semibold">{formatYen(summary.netYen)}</dd>
          </div>
        </dl>
      ) : (
        <p>数値を表示できません</p>
      )}
    </section>
  );
}
