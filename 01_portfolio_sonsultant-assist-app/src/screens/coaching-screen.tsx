"use client";

import { useEffect, useRef } from "react";
import { copy } from "@/mock/copy";
import { useAdvanceScript } from "@/mock/use-advance-script";
import { useMockRuntime } from "@/mock/runtime";
import { ChatBubble, Composer, InlineMessage } from "@/ui/primitives";
import styles from "./coaching-screen.module.css";

export function CoachingScreen() {
  const runtime = useMockRuntime();
  const { isThinking, draft, setDraft, error, advance } = useAdvanceScript();
  const endRef = useRef<HTMLDivElement>(null);
  const messages = runtime.state.messages;

  useEffect(() => {
    if (messages.length > 0) {
      return;
    }
    if (!runtime.beginOpeningTurn()) {
      return;
    }
    void advance();
  }, [advance, messages.length, runtime]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isThinking]);

  function handleSend() {
    const text = draft.trim();
    if (text) {
      runtime.appendUserMessage(text);
    }
    void advance();
  }

  return (
    <section className={styles.stage} data-screen="coaching">
      <div className={styles.thread} data-part="thread">
        {messages.map((message, index) => (
          <div
            key={`${message.speaker}-${index}`}
            className={
              message.speaker === "ai" ? styles.rowAi : styles.rowUser
            }
          >
            <ChatBubble speaker={message.speaker}>{message.text}</ChatBubble>
          </div>
        ))}
        {isThinking ? (
          <p className={styles.thinking}>{copy.coaching.thinking}</p>
        ) : null}
        <div ref={endRef} />
      </div>
      <div className={styles.dock}>
        {error ? (
          <InlineMessage
            onRetry={() => {
              void advance();
            }}
          >
            {error.message}
          </InlineMessage>
        ) : null}
        <Composer
          id="coaching-composer"
          label={copy.coaching.composerLabel}
          placeholder={copy.coaching.composerPlaceholder}
          value={draft}
          onChange={setDraft}
          onSend={handleSend}
          disabled={isThinking}
        />
      </div>
    </section>
  );
}
