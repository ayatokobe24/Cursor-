import type { ShellKind } from "./types";

export const STEPPER_STEPS = [
  { id: "consult", label: "相談" },
  { id: "organize", label: "整理" },
  { id: "hypothesis", label: "仮説" },
  { id: "action", label: "打ち手" },
  { id: "execute", label: "実行" },
  { id: "reflect", label: "振り返り" },
] as const;

export type StepperStepId = (typeof STEPPER_STEPS)[number]["id"];

export type StepperStatus = "complete" | "current" | "future";

export const STEPPER_LABELS: readonly [
  "相談",
  "整理",
  "仮説",
  "打ち手",
  "実行",
  "振り返り",
] = ["相談", "整理", "仮説", "打ち手", "実行", "振り返り"];

const STEP_IDS: readonly StepperStepId[] = STEPPER_STEPS.map((step) => step.id);

const DEMO_STEP_ALIASES: Record<string, StepperStepId> = {
  consult: "consult",
  相談: "consult",
  organize: "organize",
  整理: "organize",
  hypothesis: "hypothesis",
  仮説: "hypothesis",
  action: "action",
  打ち手: "action",
  execute: "execute",
  実行: "execute",
  reflect: "reflect",
  振り返り: "reflect",
};

export function shouldShowStepper(kind: ShellKind): boolean {
  return kind === "standard";
}

export function getStepperStatus(
  current: StepperStepId,
  step: StepperStepId,
): StepperStatus {
  const currentIndex = stepIndex(current);
  const targetIndex = stepIndex(step);

  if (targetIndex < currentIndex) {
    return "complete";
  }

  if (targetIndex === currentIndex) {
    return "current";
  }

  return "future";
}

export function canNavigateToStep(
  current: StepperStepId,
  selected: StepperStepId,
): boolean {
  const currentIndex = stepIndex(current);
  const selectedIndex = stepIndex(selected);

  if (selectedIndex > currentIndex) {
    return false;
  }

  return selectedIndex === currentIndex || selectedIndex === currentIndex - 1;
}

export function applyStepSelection(
  current: StepperStepId,
  selected: StepperStepId,
): StepperStepId {
  if (!canNavigateToStep(current, selected)) {
    return current;
  }

  return selected;
}

export function resolveDemoStep(
  value: string | string[] | undefined,
): StepperStepId {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return "consult";
  }

  return DEMO_STEP_ALIASES[raw] ?? "consult";
}

function stepIndex(id: StepperStepId): number {
  return STEP_IDS.indexOf(id);
}
