"use client";

import { cx } from "@/ui/primitives/cx";
import styles from "./shell.module.css";
import {
  applyStepSelection,
  getStepperStatus,
  STEPPER_STEPS,
  type StepperStepId,
} from "./stepper-model";

export type StepperProps = {
  current: StepperStepId;
  onStepSelect?: (step: StepperStepId) => void;
};

function CheckIcon() {
  return (
    <svg
      className={styles.stepperCheck}
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.5 8.2 6.4 11l6.1-6.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Stepper({ current, onStepSelect }: StepperProps) {
  return (
    <nav className={styles.stepper} data-part="stepper" aria-label="相談の進み">
      <ol className={styles.stepperList}>
        {STEPPER_STEPS.map((step, index) => {
          const status = getStepperStatus(current, step.id);
          const isFuture = status === "future";

          return (
            <li key={step.id} className={styles.stepperItem}>
              {index > 0 ? <span className={styles.stepperLine} /> : null}
              <button
                type="button"
                className={cx(
                  styles.stepperButton,
                  status === "complete" && styles.stepperComplete,
                  status === "current" && styles.stepperCurrent,
                  isFuture && styles.stepperFuture,
                )}
                data-step={step.id}
                data-status={status}
                aria-current={status === "current" ? "step" : undefined}
                disabled={isFuture}
                onClick={() => {
                  const next = applyStepSelection(current, step.id);
                  if (next === current) {
                    return;
                  }
                  onStepSelect?.(next);
                }}
              >
                {status === "complete" ? <CheckIcon /> : null}
                <span>{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
