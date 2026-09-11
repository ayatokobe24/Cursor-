import type { ReactNode } from "react";
import type { StepperStepId } from "./stepper-model";

export type ShellKind = "none" | "header-only" | "standard" | "admin";

export interface AppShellProps {
  kind: ShellKind;
  stepLabel?: string;
  currentStep?: StepperStepId;
  children: ReactNode;
}
