import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type * as StepperModel from "./stepper-model";

const dir = path.dirname(fileURLToPath(import.meta.url));
const stepperPath = path.join(dir, "stepper.tsx");

const EXPECTED_LABELS = [
  "相談",
  "整理",
  "仮説",
  "打ち手",
  "実行",
  "振り返り",
] as const;

describe("Stepper (Requirement 3.5-3.7)", () => {
  test("src/ui/shell/stepper.tsx exists", () => {
    assert.equal(existsSync(stepperPath), true);
  });

  test("labels are 相談 → 整理 → 仮説 → 打ち手 → 実行 → 振り返り", async () => {
    const { STEPPER_LABELS } = await loadModel();
    assert.deepEqual([...STEPPER_LABELS], [...EXPECTED_LABELS]);
  });

  test("login and consent shells do not show the stepper", async () => {
    const { shouldShowStepper } = await loadModel();
    assert.equal(shouldShowStepper("none"), false);
    assert.equal(shouldShowStepper("header-only"), false);
    assert.equal(shouldShowStepper("admin"), false);
    assert.equal(shouldShowStepper("standard"), true);
  });

  test("selecting a future step does not change the current step", async () => {
    const { applyStepSelection } = await loadModel();

    assert.equal(applyStepSelection("consult", "organize"), "consult");
    assert.equal(applyStepSelection("consult", "reflect"), "consult");
    assert.equal(applyStepSelection("organize", "action"), "organize");
    assert.equal(applyStepSelection("hypothesis", "execute"), "hypothesis");
  });

  test("current stays on current, and only the immediate previous may go back", async () => {
    const { applyStepSelection } = await loadModel();

    assert.equal(applyStepSelection("consult", "consult"), "consult");
    assert.equal(applyStepSelection("organize", "consult"), "consult");
    assert.equal(applyStepSelection("hypothesis", "consult"), "hypothesis");
  });

  test("?demoStep= resolves known ids or labels, otherwise 相談", async () => {
    const { resolveDemoStep } = await loadModel();

    assert.equal(resolveDemoStep(undefined), "consult");
    assert.equal(resolveDemoStep("organize"), "organize");
    assert.equal(resolveDemoStep("整理"), "organize");
    assert.equal(resolveDemoStep(["reflect", "action"]), "reflect");
    assert.equal(resolveDemoStep("unknown"), "consult");
  });
});

async function loadModel(): Promise<typeof StepperModel> {
  return import(
    pathToFileURL(path.join(dir, "stepper-model.ts")).href
  ) as Promise<typeof StepperModel>;
}
