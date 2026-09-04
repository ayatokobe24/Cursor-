export type FieldErrors = { fields: Record<string, string> };

export type AppError =
  | { kind: "validation"; fields: Record<string, string> }
  | { kind: "unauthenticated" }
  | { kind: "notFound" }
  | { kind: "unavailable"; message: string };

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  amountYen: number;
  occurredOn: string;
  memo: string | null;
};

export type TransactionDraft = {
  type: TransactionType;
  amountYen: number;
  occurredOn: string;
  memo: string | null;
};

export type MonthId = string;

export type MonthSummaryView = {
  incomeTotalYen: number;
  expenseTotalYen: number;
  netYen: number;
};
