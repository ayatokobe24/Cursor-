import type { Metadata } from "next";
import { PrimitivesPreview } from "./primitives-preview";

export const metadata: Metadata = {
  title: "基本部品の確認（開発用）",
  description:
    "カード・入力・主操作・送信の見た目確認。製品ホームではありません。",
};

export default function PrimitivesPage() {
  return <PrimitivesPreview />;
}
