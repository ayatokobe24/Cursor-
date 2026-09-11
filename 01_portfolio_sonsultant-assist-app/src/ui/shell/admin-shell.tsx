import type { ReactNode } from "react";
import styles from "./shell.module.css";

export type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className={styles.admin} data-shell-kind="admin">
      <header className={styles.adminHeader} data-part="admin-header">
        <p className={styles.adminBrand}>伴走 運営（仮）</p>
      </header>
      <div className={styles.adminBody}>{children}</div>
    </div>
  );
}
