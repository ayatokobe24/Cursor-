import type { Metadata } from "next";
import Form from "next/form";
import { PrimaryButton } from "@/ui/primitives";
import { AppShell, PlaceholderPanel } from "@/ui/shell";
import styles from "@/ui/shell/shell.module.css";

export const metadata: Metadata = {
  title: "同意（プレースホルダ）",
  description: "初回同意のヘッダーのみシェル確認用プレースホルダ。",
};

export default function ConsentPage() {
  return (
    <AppShell kind="header-only">
      <PlaceholderPanel kicker="SCR-002 初回相当" title="同意（プレースホルダ）">
        <p className={styles.placeholderLead}>
          ヘッダーだけを出し、サイドバーは出していません。
        </p>
        <Form action="/consult/new">
          <PrimaryButton type="submit">相談へ進む（プレースホルダ）</PrimaryButton>
        </Form>
      </PlaceholderPanel>
    </AppShell>
  );
}
