import type { Metadata } from "next";
import Form from "next/form";
import { PrimaryButton } from "@/ui/primitives";
import { AppShell, PlaceholderPanel } from "@/ui/shell";
import styles from "@/ui/shell/shell.module.css";

export const metadata: Metadata = {
  title: "ログイン（プレースホルダ）",
  description: "シェルなし中央カラムの確認用プレースホルダ。製品コピーではありません。",
};

export default function LoginPage() {
  return (
    <AppShell kind="none">
      <PlaceholderPanel kicker="SCR-001 相当" title="ログイン（プレースホルダ）">
        <p className={styles.placeholderLead}>
          ヘッダーもサイドバーもない、中央の単一カラムです。
        </p>
        <Form action="/consent">
          <PrimaryButton type="submit">次へ（プレースホルダ）</PrimaryButton>
        </Form>
      </PlaceholderPanel>
    </AppShell>
  );
}
