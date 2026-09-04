import type { SessionUser } from "@/lib/auth/types";
import { err, ok, type Result } from "@/lib/result";
import { parseDraft } from "./validation";
import type { AppError, Transaction, TransactionDraft } from "./types";

export type TransactionActionDeps = {
  requireUser: () => Promise<Result<SessionUser, AppError>>;
  insert: (
    userId: string,
    draft: TransactionDraft,
  ) => Promise<Result<Transaction, AppError>>;
  update: (
    userId: string,
    id: string,
    draft: TransactionDraft,
  ) => Promise<Result<Transaction, AppError>>;
  remove: (
    userId: string,
    id: string,
  ) => Promise<Result<void, AppError>>;
  revalidateHome: () => void;
};

export async function createTransaction(
  input: unknown,
  deps: Pick<TransactionActionDeps, "requireUser" | "insert" | "revalidateHome">,
): Promise<Result<{ id: string }, AppError>> {
  const user = await deps.requireUser();
  if (!user.ok) {
    return user;
  }

  const draft = parseDraft(input);
  if (!draft.ok) {
    return err({ kind: "validation", fields: draft.error.fields });
  }

  const saved = await deps.insert(user.value.userId, draft.value);
  if (!saved.ok) {
    return saved;
  }

  deps.revalidateHome();
  return ok({ id: saved.value.id });
}

export async function updateTransaction(
  id: string,
  input: unknown,
  deps: Pick<TransactionActionDeps, "requireUser" | "update" | "revalidateHome">,
): Promise<Result<{ id: string }, AppError>> {
  const user = await deps.requireUser();
  if (!user.ok) {
    return user;
  }

  const draft = parseDraft(input);
  if (!draft.ok) {
    return err({ kind: "validation", fields: draft.error.fields });
  }

  const saved = await deps.update(user.value.userId, id, draft.value);
  if (!saved.ok) {
    return saved;
  }

  deps.revalidateHome();
  return ok({ id: saved.value.id });
}

export async function deleteTransaction(
  id: string,
  confirmed: boolean,
  deps: Pick<TransactionActionDeps, "requireUser" | "remove" | "revalidateHome">,
): Promise<Result<void, AppError>> {
  const user = await deps.requireUser();
  if (!user.ok) {
    return user;
  }

  if (!confirmed) {
    return ok(undefined);
  }

  const removed = await deps.remove(user.value.userId, id);
  if (!removed.ok) {
    return removed;
  }

  deps.revalidateHome();
  return ok(undefined);
}
