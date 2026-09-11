import styles from "./shell.module.css";

export type HeaderProps = {
  stepLabel?: string;
};

function PauseIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 5v10M13 5v10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PrivacyIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 3.5 4.5 6v4.2c0 3.2 2.3 5.7 5.5 6.8 3.2-1.1 5.5-3.6 5.5-6.8V6L10 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4.5 16.2c.8-2.2 2.9-3.7 5.5-3.7s4.7 1.5 5.5 3.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Header({ stepLabel }: HeaderProps) {
  return (
    <header className={styles.header} data-part="header">
      <p className={styles.brand}>伴走（仮）</p>
      {stepLabel ? <p className={styles.stepLabel}>{stepLabel}</p> : <span />}
      <div className={styles.headerActions}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="保存して終了"
        >
          <PauseIcon />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="プライバシー"
        >
          <PrivacyIcon />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="アカウント"
        >
          <AccountIcon />
        </button>
      </div>
    </header>
  );
}
