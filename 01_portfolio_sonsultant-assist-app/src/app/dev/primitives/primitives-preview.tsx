"use client";

import { useState } from "react";
import {
  ChatBubble,
  Composer,
  GlassCard,
  InlineMessage,
  PrimaryButton,
  SecondaryButton,
  TextField,
  Textarea,
} from "@/ui/primitives";
import styles from "./preview.module.css";

export function PrimitivesPreview() {
  const [title, setTitle] = useState("いま困っていること");
  const [note, setNote] = useState(
    "事実と受け止めを分けて見ています。原因を一つには決めていません。",
  );
  const [draft, setDraft] = useState("");
  const [failed, setFailed] = useState(true);

  return (
    <main className={styles.page}>
      <header>
        <p className={styles.kicker}>開発用 /dev/primitives</p>
        <h1 className={styles.title}>基本部品の確認</h1>
        <p className={styles.lead}>
          製品のホームやダッシュボードではありません。ベージュの主操作は1つ、送信は別形状の丸い操作です。
        </p>
      </header>

      <GlassCard size="large">
        <div className={styles.stack}>
          <TextField
            name="preview-title"
            label="見出し"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <Textarea
            name="preview-note"
            label="確認したいこと"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          {failed ? (
            <InlineMessage onRetry={() => setFailed(false)}>
              いまは進めませんでした。入力はそのまま残しています。
            </InlineMessage>
          ) : null}
          <div className={styles.actions}>
            <SecondaryButton type="button">修正する</SecondaryButton>
            <PrimaryButton type="button">この整理で先へ進む</PrimaryButton>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className={styles.stack}>
          <div className={styles.rowStart}>
            <ChatBubble speaker="ai">
              そのとき、具体的には何がありましたか。
            </ChatBubble>
          </div>
          <div className={styles.rowEnd}>
            <ChatBubble speaker="user">
              期限が重なって、手が止まっています。
            </ChatBubble>
          </div>
          <Composer
            value={draft}
            onChange={setDraft}
            onSend={() => setDraft("")}
            placeholder="いまの状況を短く書いて送る"
          />
        </div>
      </GlassCard>
    </main>
  );
}
