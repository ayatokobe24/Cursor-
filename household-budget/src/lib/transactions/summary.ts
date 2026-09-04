import type { Transaction, MonthSummaryView } from "./types";

export function summarize(items: Transaction[]): MonthSummaryView {
  const incomeTotalYen = items
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amountYen, 0);
  const expenseTotalYen = items
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amountYen, 0);

  return {
    incomeTotalYen,
    expenseTotalYen,
    netYen: incomeTotalYen - expenseTotalYen,
  };
}
