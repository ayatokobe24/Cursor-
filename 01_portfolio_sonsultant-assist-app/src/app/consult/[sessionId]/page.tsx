import type { Metadata } from "next";
import { AppShell } from "@/ui/shell";

export const metadata: Metadata = {
  title: "対話｜伴走（仮）",
  description: "対話は次のタスク",
};

export default async function ConsultSessionPage({
  params,
}: PageProps<"/consult/[sessionId]">) {
  await params;

  return (
    <AppShell kind="standard" currentStep="consult">
      <p>対話は次のタスク</p>
    </AppShell>
  );
}
