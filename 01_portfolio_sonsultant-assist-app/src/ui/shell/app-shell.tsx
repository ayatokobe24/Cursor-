import { AdminShell } from "./admin-shell";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import styles from "./shell.module.css";
import type { AppShellProps } from "./types";

export type { AppShellProps, ShellKind } from "./types";

export function AppShell({ kind, stepLabel, children }: AppShellProps) {
  if (kind === "admin") {
    return <AdminShell>{children}</AdminShell>;
  }

  if (kind === "none") {
    return (
      <div className={styles.none} data-shell-kind="none">
        <div className={styles.noneColumn}>{children}</div>
      </div>
    );
  }

  const showSidebar = kind === "standard";
  const headerStepLabel = kind === "standard" ? stepLabel : undefined;

  return (
    <div className={styles.shell} data-shell-kind={kind}>
      <Header stepLabel={headerStepLabel} />
      <div className={styles.body}>
        {showSidebar ? <Sidebar /> : null}
        <main className={styles.main}>
          <div className={styles.mainInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}
