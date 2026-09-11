import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type * as ConsentModel from "./consent-model";

const dir = path.dirname(fileURLToPath(import.meta.url));
const screenPath = path.join(dir, "consent-screen.tsx");
const modelPath = path.join(dir, "consent-model.ts");
const pagePath = path.join(dir, "..", "app", "consent", "page.tsx");

const REQUIRED_LABELS = [
  "所属企業から独立した第三者サービスであること",
  "相談内容を所属企業へ提供しないこと",
  "人事評価に使わないこと",
] as const;

describe("ConsentScreen (Requirement 3.2, 4.4, 4.5)", () => {
  test("src/screens/consent-screen.tsx exists", () => {
    assert.equal(existsSync(screenPath), true);
  });

  test("consent page wires ConsentScreen with AppShell kind=header-only", () => {
    assert.equal(existsSync(pagePath), true);
    const source = readFileSync(pagePath, "utf8");
    assert.match(source, /ConsentScreen/);
    assert.match(source, /from ["']@\/screens\/consent-screen["']/);
    assert.match(source, /AppShell/);
    assert.match(source, /kind=["']header-only["']/);
    assert.doesNotMatch(source, /PlaceholderPanel/);
    assert.doesNotMatch(source, /相談へ進む（プレースホルダ）/);
    assert.doesNotMatch(source, /kind=["']standard["']/);
    assert.doesNotMatch(source, /kind=["']none["']/);
    assert.doesNotMatch(source, /SCR-\d+/);
  });

  test("consent screen uses primitives, mock copy, and MockRuntime.completeConsent", () => {
    const source = readFileSync(screenPath, "utf8");
    assert.match(source, /GlassCard/);
    assert.match(source, /PrimaryButton/);
    assert.match(source, /useMockRuntime/);
    assert.match(source, /\.completeConsent\(/);
    assert.match(source, /copy\.consent/);
    assert.match(source, /['"]use client['"]/);
    assert.doesNotMatch(source, /PlaceholderPanel/);
    assert.doesNotMatch(source, /SCR-\d+/);
    assert.doesNotMatch(source, /\bany\b/);
    assert.doesNotMatch(source, /5W3H/);
    assert.doesNotMatch(source, /Sidebar|Stepper/);
  });

  test("copy matches MOCK-DEC-01 SCR-002 and has no optional items", () => {
    const source = readFileSync(screenPath, "utf8");
    for (const label of REQUIRED_LABELS) {
      assert.match(source, /copy\.consent/);
      assert.equal(source.includes(label), false, "labels live in copy.ts, not duplicated in the screen");
    }
    assert.doesNotMatch(source, /任意/);
    const copySource = readFileSync(path.join(dir, "..", "mock", "copy.ts"), "utf8");
    for (const label of REQUIRED_LABELS) {
      assert.equal(copySource.includes(label), true, `copy.ts must include ${label}`);
    }
    assert.equal(copySource.includes("相談を始める前に"), true);
    assert.equal(copySource.includes("安心して話せるように、情報の扱いを確認します。"), true);
    assert.equal(copySource.includes("同意して進む"), true);
    assert.equal(
      copySource.includes("必要な確認が終わるまで、次へは進めません。"),
      true,
    );
    assert.equal(
      copySource.includes("あなたが明示的に同意しない限り、相談内容は公開されません。"),
      true,
    );
    assert.doesNotMatch(copySource, /任意同意|任意項目/);
  });

  test("CTA stays disabled until all 3 required items are checked", async () => {
    const {
      createInitialConsentChecks,
      isConsentReady,
      toggleConsentCheck,
    } = await loadModel();

    let checks = createInitialConsentChecks();
    assert.equal(isConsentReady(checks), false);

    checks = toggleConsentCheck(checks, "thirdParty");
    assert.equal(isConsentReady(checks), false);

    checks = toggleConsentCheck(checks, "noCompanyShare");
    assert.equal(isConsentReady(checks), false);

    checks = toggleConsentCheck(checks, "noHrEval");
    assert.equal(isConsentReady(checks), true);

    const source = readFileSync(screenPath, "utf8");
    assert.match(source, /disabled=\{!/);
    assert.match(source, /copy\.consent\.disabledReason/);
    assert.match(source, /copy\.consent\.cta/);
  });

  test("completed consent navigates to consult input", async () => {
    const { routeAfterConsent } = await loadModel();
    assert.equal(routeAfterConsent(), "/consult/new");

    const source = readFileSync(screenPath, "utf8");
    assert.match(source, /routeAfterConsent/);
    assert.match(source, /router\.push/);
  });
});

async function loadModel(): Promise<typeof ConsentModel> {
  return import(pathToFileURL(modelPath).href) as Promise<typeof ConsentModel>;
}
