import { fromMonthId } from "@/lib/month";
import { err, ok, type Result } from "@/lib/result";
import type {
  AppError,
  MonthId,
  Transaction,
  TransactionDraft,
  TransactionType,
} from "./types";

const COLUMNS = "id, user_id, type, amount, occurred_on, memo";

type QueryResult = { data: unknown; error: { message: string } | null };

export type FilterQuery = {
  select: (columns?: string) => FilterQuery;
  eq: (column: string, value: unknown) => FilterQuery;
  gte: (column: string, value: unknown) => FilterQuery;
  lt: (column: string, value: unknown) => FilterQuery;
  order: (column: string, options?: { ascending: boolean }) => FilterQuery;
  maybeSingle: () => PromiseLike<QueryResult>;
  single: () => PromiseLike<QueryResult>;
  then: Promise<QueryResult>["then"];
};

export type TransactionQuery = {
  select: (columns?: string) => FilterQuery;
  insert: (payload: unknown) => FilterQuery;
  update: (payload: unknown) => FilterQuery;
  delete: () => FilterQuery;
};

export type TransactionStore = {
  from: (table: string) => unknown;
};

function table(store: TransactionStore): TransactionQuery {
  return store.from("transactions") as TransactionQuery;
}

type DbRow = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  occurred_on: string;
  memo: string | null;
};

function unavailable(message: string): Result<never, AppError> {
  return err({ kind: "unavailable", message });
}

function isRow(value: unknown): value is DbRow {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.user_id === "string" &&
    (row.type === "income" || row.type === "expense") &&
    typeof row.amount === "number" &&
    typeof row.occurred_on === "string" &&
    (row.memo === null || typeof row.memo === "string")
  );
}

function toTransaction(row: DbRow): Transaction {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    amountYen: row.amount,
    occurredOn: row.occurred_on,
    memo: row.memo,
  };
}

function toPayload(userId: string, draft: TransactionDraft) {
  return {
    user_id: userId,
    type: draft.type,
    amount: draft.amountYen,
    occurred_on: draft.occurredOn,
    memo: draft.memo,
  };
}

export async function listByMonth(
  store: TransactionStore,
  userId: string,
  monthId: MonthId,
): Promise<Result<Transaction[], AppError>> {
  const { startDate, nextStartDate } = fromMonthId(monthId);
  const { data, error } = await table(store)
    .select(COLUMNS)
    .eq("user_id", userId)
    .gte("occurred_on", startDate)
    .lt("occurred_on", nextStartDate)
    .order("occurred_on", { ascending: false });

  if (error) {
    return unavailable("記録を取得できませんでした");
  }

  const rows = Array.isArray(data) ? data.filter(isRow) : [];
  return ok(rows.map(toTransaction));
}

export async function getById(
  store: TransactionStore,
  userId: string,
  id: string,
): Promise<Result<Transaction, AppError>> {
  const { data, error } = await table(store)
    .select(COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return unavailable("記録を取得できませんでした");
  }
  if (!isRow(data)) {
    return err({ kind: "notFound" });
  }
  return ok(toTransaction(data));
}

export async function insert(
  store: TransactionStore,
  userId: string,
  draft: TransactionDraft,
): Promise<Result<Transaction, AppError>> {
  const { data, error } = await table(store)
    .insert(toPayload(userId, draft))
    .select(COLUMNS)
    .single();

  if (error || !isRow(data)) {
    return unavailable("記録を保存できませんでした");
  }
  return ok(toTransaction(data));
}

export async function update(
  store: TransactionStore,
  userId: string,
  id: string,
  draft: TransactionDraft,
): Promise<Result<Transaction, AppError>> {
  const { data, error } = await table(store)
    .update(toPayload(userId, draft))
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .maybeSingle();

  if (error) {
    return unavailable("記録を保存できませんでした");
  }
  if (!isRow(data)) {
    return err({ kind: "notFound" });
  }
  return ok(toTransaction(data));
}

export async function remove(
  store: TransactionStore,
  userId: string,
  id: string,
): Promise<Result<void, AppError>> {
  const { data, error } = await table(store)
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select(COLUMNS)
    .maybeSingle();

  if (error) {
    return unavailable("記録を削除できませんでした");
  }
  if (!isRow(data)) {
    return err({ kind: "notFound" });
  }
  return ok(undefined);
}
