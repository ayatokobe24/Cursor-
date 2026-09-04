import type { MonthId } from "@/lib/transactions/types";

const MONTH_ID = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function currentMonthId(now: Date): MonthId {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function fromMonthId(monthId: MonthId): {
  startDate: string;
  nextStartDate: string;
} {
  const match = MONTH_ID.exec(monthId);
  if (!match) {
    throw new Error("不正な対象月です");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const startDate = `${match[1]}-${match[2]}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextStartDate = `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-01`;

  return { startDate, nextStartDate };
}

export function resolveMonthId(
  monthId: string | null | undefined,
  now: Date,
): MonthId {
  if (monthId && MONTH_ID.test(monthId)) {
    return monthId;
  }
  return currentMonthId(now);
}

export function shiftMonthId(monthId: MonthId, delta: number): MonthId {
  const match = MONTH_ID.exec(monthId);
  if (!match) {
    throw new Error("不正な対象月です");
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1 + delta;
  return currentMonthId(new Date(year, monthIndex, 1));
}
