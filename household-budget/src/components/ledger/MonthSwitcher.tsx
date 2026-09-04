import Link from "next/link";
import { shiftMonthId } from "@/lib/month";
import type { MonthId } from "@/lib/transactions/types";

type MonthSwitcherProps = {
  monthId: MonthId;
};

export function MonthSwitcher({ monthId }: MonthSwitcherProps) {
  const previous = shiftMonthId(monthId, -1);
  const next = shiftMonthId(monthId, 1);

  return (
    <nav aria-label="対象月" className="flex items-center justify-between gap-4">
      <Link href={`/?month=${previous}`} className="font-medium underline">
        前の月
      </Link>
      <p className="text-lg font-semibold">{monthId}</p>
      <Link href={`/?month=${next}`} className="font-medium underline">
        次の月
      </Link>
    </nav>
  );
}
