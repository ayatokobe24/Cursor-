import type { FormEvent, KeyboardEvent } from "react";
import { cx } from "./cx";
import styles from "./primitives.module.css";

export type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  id?: string;
};

function SendIcon() {
  return (
    <svg
      className={styles.composerSendIcon}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 10h10M11 5l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Composer({
  value,
  onChange,
  onSend,
  placeholder,
  disabled = false,
  label = "対話の入力",
  id = "composer-input",
}: ComposerProps) {
  const canSend = !disabled && value.trim() !== "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) {
      return;
    }
    onSend();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) {
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (canSend) {
        onSend();
      }
    }
  }

  return (
    <form className={styles.composer} data-primitive="Composer" onSubmit={handleSubmit}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className={styles.composerRow}>
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className={cx(styles.fieldControl, styles.composerInput)}
        />
        <button
          type="submit"
          data-primitive="ComposerSend"
          className={styles.composerSend}
          disabled={!canSend}
          aria-label="送信"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
}
