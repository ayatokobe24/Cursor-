import type { Metadata } from "next";
import { PrimaryButton } from "@/ui/primitives";
import { AppShell, PlaceholderPanel } from "@/ui/shell";
import styles from "@/ui/shell/shell.module.css";

export const metadata: Metadata = {
  title: "新しい相談（プレースホルダ）",
  description: "標準シェルとコア再訪入口の確認用プレースホルダ。",
};

export default function ConsultNewPage() {
  return (
    <AppShell kind="standard">
      <PlaceholderPanel kicker="SCR-003 相当" title="新しい相談（プレースホルダ）">
        <p className={styles.placeholderLead}>
          ヘッダーとサイドバーと本文領域です。ナビは「新しい相談」「進行中の相談」「振り返り」だけです。
        </p>
        <PrimaryButton type="button">書き始める（プレースホルダ）</PrimaryButton>
      </PlaceholderPanel>
    </AppShell>
  );
}
