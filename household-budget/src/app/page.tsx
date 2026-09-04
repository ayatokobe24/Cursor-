import { redirect } from "next/navigation";
import { signOut } from "@/actions/auth";
import {
  create,
  removeRecord,
  updateRecord,
} from "@/actions/transactions";
import { LedgerHome } from "@/components/ledger/LedgerHome";
import { requireUser } from "@/lib/auth/session";
import { resolveMonthId } from "@/lib/month";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { loadLedger, presentLoadedLedger } from "@/lib/transactions/loader";
import { listByMonth } from "@/lib/transactions/repository";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const result = await loadLedger(params.month ?? null, new Date(), {
    requireUser,
    listByMonth: (userId, monthId) => listByMonth(supabase, userId, monthId),
  });

  if (!result.ok && result.error.kind === "unauthenticated") {
    redirect("/login");
  }

  const view = presentLoadedLedger(
    result,
    resolveMonthId(params.month ?? null, new Date()),
  );

  return (
    <LedgerHome
      monthId={view.monthId}
      summary={view.summary}
      items={view.items}
      loadError={view.loadError}
      saveTransaction={create}
      updateTransaction={updateRecord}
      deleteTransaction={removeRecord}
      signOut={signOut}
    />
  );
}
