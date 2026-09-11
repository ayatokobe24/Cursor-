import type { ReactNode } from "react";

export type ShellKind = "none" | "header-only" | "standard" | "admin";

export interface AppShellProps {
  kind: ShellKind;
  stepLabel?: string;
  children: ReactNode;
}
