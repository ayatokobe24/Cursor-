import type { Metadata } from "next";
import { ConsultStartScreen } from "@/screens/consult-start-screen";
import { AppShell } from "@/ui/shell";

export const metadata: Metadata = {
  title: "いま困っていることを書く｜伴走（仮）",
  description:
    "うまくまとめなくて大丈夫です。いま頭にあることを、そのまま書いてください。",
};

export default function ConsultNewPage() {
  return (
    <AppShell kind="standard" currentStep="consult">
      <ConsultStartScreen />
    </AppShell>
  );
}
