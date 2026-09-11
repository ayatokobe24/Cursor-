import type { Metadata } from "next";
import { LoginScreen } from "@/screens/login-screen";
import { AppShell } from "@/ui/shell";

export const metadata: Metadata = {
  title: "ログイン｜伴走（仮）",
  description:
    "仕事のつまずきを、一人で抱えずに次の一歩まで整理するための、所属企業から独立した場です。",
};

export default function LoginPage() {
  return (
    <AppShell kind="none">
      <LoginScreen />
    </AppShell>
  );
}
