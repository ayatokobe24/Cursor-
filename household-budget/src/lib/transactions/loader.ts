import { resolveMonthId } from "@/lib/month";
import type { Result } from "@/lib/result";
import type { SessionUser } from "@/lib/auth/types";
import { summarize } from "./summary";
import type {
  AppError,
  MonthId,
  MonthSummaryView,
  Transaction,
} from "./types";

export type LedgerView = {
  monthId: MonthId;
  items: Transaction[];
  summary: MonthSummaryView;
};

export type LedgerLoaderDeps = {
  requireUser: () => Promise<Result<SessionUser, AppError>>;
  listByMonth: (
    userId: string,
    monthId: MonthId,
  ) => Promise<Result<Transaction[], AppError>>;
};

export async function loadLedger(
  monthParam: string | null | undefined,
  now: Date,
  deps: LedgerLoaderDeps,
): Promise<Result<LedgerView, AppError>> {
  const user = await deps.requireUser();
  if (!user.ok) {
    return user;
  }

  const monthId = resolveMonthId(monthParam, now);
  const items = await deps.listByMonth(user.value.userId, monthId);
  if (!items.ok) {
    return items;
  }

  return {
    ok: true,
    value: {
      monthId,
      items: items.value,
      summary: summarize(items.value),
    },
  };
}

export type PresentedLedger = {
  monthId: MonthId;
  items: Transaction[];
  summary: MonthSummaryView | null;
  loadError: string | null;
};

export function presentLoadedLedger(
  result: Result<LedgerView, AppError>,
  fallbackMonthId: MonthId,
): PresentedLedger {
  if (result.ok) {
    return {
      monthId: result.value.monthId,
      items: result.value.items,
      summary: result.value.summary,
      loadError: null,
    };
  }

  const loadError =
    result.error.kind === "unavailable"
      ? result.error.message
      : "記録を取得できませんでした";

  return {
    monthId: fallbackMonthId,
    items: [],
    summary: null,
    loadError,
  };
}
