import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./primitives.module.css";

export type ChatBubbleProps = {
  speaker: "ai" | "user";
  children: ReactNode;
};

export function ChatBubble({ speaker, children }: ChatBubbleProps) {
  return (
    <p
      data-primitive="ChatBubble"
      data-speaker={speaker}
      className={cx(
        styles.chatBubble,
        speaker === "ai" ? styles.chatBubbleAi : styles.chatBubbleUser,
      )}
    >
      {children}
    </p>
  );
}
