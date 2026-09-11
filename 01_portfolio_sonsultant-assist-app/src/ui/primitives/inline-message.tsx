import type { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./primitives.module.css";
import { SecondaryButton } from "./secondary-button";

export type InlineMessageProps = {
  children: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function InlineMessage({
  children,
  onRetry,
  retryLabel = "やり直す",
  className,
}: InlineMessageProps) {
  return (
    <div
      role="alert"
      data-primitive="InlineMessage"
      className={cx(styles.inlineMessage, className)}
    >
      <p className={styles.inlineMessageBody}>{children}</p>
      {onRetry ? (
        <SecondaryButton
          className={styles.inlineMessageRetry}
          onClick={onRetry}
        >
          {retryLabel}
        </SecondaryButton>
      ) : null}
    </div>
  );
}
