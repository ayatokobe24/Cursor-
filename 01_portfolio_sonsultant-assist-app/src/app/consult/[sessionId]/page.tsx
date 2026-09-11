import type { Metadata } from "next";
import { CoachingScreen } from "@/screens/coaching-screen";
import { AppShell } from "@/ui/shell";

export const metadata: Metadata = {
  title: "対話｜伴走（仮）",
  description: "いま困っていることを、問いを一つずつ整理します。",
};

export default async function ConsultSessionPage({
  params,
}: PageProps<"/consult/[sessionId]">) {
  await params;

  return (
    <AppShell kind="standard" currentStep="consult">
      <CoachingScreen />
    </AppShell>
  );
}
