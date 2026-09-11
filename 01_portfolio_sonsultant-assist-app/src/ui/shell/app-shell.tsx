import { AdminShell } from "./admin-shell";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import styles from "./shell.module.css";
import { Stepper } from "./stepper";
import { shouldShowStepper } from "./stepper-model";
import type { AppShellProps } from "./types";

export type { AppShellProps, ShellKind } from "./types";

export function AppShell({
  kind,
  stepLabel,
  currentStep = "consult",
  children,
}: AppShellProps) {
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
  const showStepper = shouldShowStepper(kind);
  const headerStepLabel = kind === "standard" ? stepLabel : undefined;

  return (
    <div className={styles.shell} data-shell-kind={kind}>
      <Header stepLabel={headerStepLabel} />
      <div className={styles.body}>
        {showSidebar ? <Sidebar /> : null}
        <main className={styles.main}>
          <div className={styles.mainInner}>
            {showStepper ? <Stepper current={currentStep} /> : null}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
