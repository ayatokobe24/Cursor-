import type { Metadata } from "next";
import { ConsentScreen } from "@/screens/consent-screen";
import { AppShell } from "@/ui/shell";

export const metadata: Metadata = {
  title: "相談を始める前に｜伴走（仮）",
  description: "安心して話せるように、情報の扱いを確認します。",
};

export default function ConsentPage() {
  return (
    <AppShell kind="header-only">
      <ConsentScreen />
    </AppShell>
  );
}
