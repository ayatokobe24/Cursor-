import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type * as ConsultStartModel from "./consult-start-model";

const dir = path.dirname(fileURLToPath(import.meta.url));
const screenPath = path.join(dir, "consult-start-screen.tsx");
const modelPath = path.join(dir, "consult-start-model.ts");
const pagePath = path.join(dir, "..", "app", "consult", "new", "page.tsx");
const sessionPagePath = path.join(
  dir,
  "..",
  "app",
  "consult",
  "[sessionId]",
  "page.tsx",
);

const MOCK_DEC_COPY = {
  title: "いま困っていることを書く",
  reassurance:
    "うまくまとめなくて大丈夫です。いま頭にあることを、そのまま書いてください。",
  hint: "何があったか、何が一番つらいかを、そのまま書いてください。",
  confidentiality:
    "顧客名、案件名、人名は、書かなくて構いません。書かれた場合は、必要なら伏せて扱います。",
  maskingNotice:
    "伏せた方がよさそうな箇所があります。内容を確認してから進めます。",
  cta: "相談を始める",
} as const;

describe("ConsultStartScreen (Requirement 2.4, 4.6, 4.7, 4.8, 4.9)", () => {
  test("src/screens/consult-start-screen.tsx exists", () => {
    assert.equal(existsSync(screenPath), true);
  });

  test("consult/new page wires ConsultStartScreen with AppShell kind=standard and current=consult", () => {
    assert.equal(existsSync(pagePath), true);
    const source = readFileSync(pagePath, "utf8");
    assert.match(source, /ConsultStartScreen/);
    assert.match(source, /from ["']@\/screens\/consult-start-screen["']/);
    assert.match(source, /AppShell/);
    assert.match(source, /kind=["']standard["']/);
    assert.match(source, /currentStep=["']consult["']/);
    assert.doesNotMatch(source, /PlaceholderPanel/);
    assert.doesNotMatch(source, /書き始める（プレースホルダ）/);
    assert.doesNotMatch(source, /kind=["']none["']/);
    assert.doesNotMatch(source, /kind=["']header-only["']/);
    assert.doesNotMatch(source, /SCR-\d+/);
  });

  test("consult start screen uses textarea hero, one beige CTA, mock copy, and startConsult", () => {
    const source = readFileSync(screenPath, "utf8");
    assert.match(source, /GlassCard/);
    assert.match(source, /Textarea/);
    assert.match(source, /PrimaryButton/);
    assert.match(source, /InlineMessage/);
    assert.match(source, /useMockRuntime/);
    assert.match(source, /\.startConsult\(/);
    assert.match(source, /copy\.consult/);
    assert.match(source, /['"]use client['"]/);
    assert.doesNotMatch(source, /PlaceholderPanel/);
    assert.doesNotMatch(source, /SCR-\d+/);
    assert.doesNotMatch(source, /\bany\b/);
    assert.doesNotMatch(source, /5W3H/);
    assert.doesNotMatch(source, /CategoryCard/);
    assert.doesNotMatch(source, /Composer/);
  });

  test("copy matches MOCK-DEC-01 SCR-003 and has no 5W3H or category fields", () => {
    const source = readFileSync(screenPath, "utf8");
    for (const value of Object.values(MOCK_DEC_COPY)) {
      assert.equal(
        source.includes(value),
        false,
        "copy lives in copy.ts, not duplicated in the screen",
      );
    }

    const copySource = readFileSync(path.join(dir, "..", "mock", "copy.ts"), "utf8");
    for (const value of Object.values(MOCK_DEC_COPY)) {
      assert.equal(copySource.includes(value), true, `copy.ts must include ${value}`);
    }
    assert.doesNotMatch(copySource, /5W3H/);
    assert.doesNotMatch(copySource, /Who|What|When|Where|Why|How/);
    assert.doesNotMatch(copySource, /課題カテゴリ|必須項目/);
  });

  test("successful start navigates to the coaching session route", async () => {
    const { routeAfterConsultStart } = await loadModel();
    assert.equal(routeAfterConsultStart("session-1"), "/consult/session-1");

    const source = readFileSync(screenPath, "utf8");
    assert.match(source, /routeAfterConsultStart/);
    assert.match(source, /router\.push/);
  });

  test("failed start keeps the textarea body and does not navigate", async () => {
    const { shouldNavigateAfterStart, retainConsultBody } = await loadModel();
    const body = "うまくまとめられないまま書いてみる";

    assert.equal(
      shouldNavigateAfterStart({ ok: false, error: { code: "LOAD_FAILED" } }),
      false,
    );
    assert.equal(
      shouldNavigateAfterStart({ ok: true, value: "session-1" }),
      true,
    );
    assert.equal(retainConsultBody(body), body);

    const source = readFileSync(screenPath, "utf8");
    assert.match(source, /retainConsultBody|setStartError|startError/);
    assert.match(source, /InlineMessage/);
  });

  test("masking confirmation is conditional on variant or a simple mock detector", async () => {
    const {
      shouldShowMaskingConfirmation,
      canStartConsultAfterMasking,
    } = await loadModel();

    assert.equal(shouldShowMaskingConfirmation("", undefined), false);
    assert.equal(
      shouldShowMaskingConfirmation("うまくまとめなくて大丈夫", undefined),
      false,
    );
    assert.equal(
      shouldShowMaskingConfirmation("株式会社サンプルの件で困っている", undefined),
      true,
    );
    assert.equal(
      shouldShowMaskingConfirmation("", "機密候補検知"),
      true,
    );
    assert.equal(shouldShowMaskingConfirmation("", "MASKING"), true);
    assert.equal(canStartConsultAfterMasking(false, false), true);
    assert.equal(canStartConsultAfterMasking(true, false), false);
    assert.equal(canStartConsultAfterMasking(true, true), true);

    const source = readFileSync(screenPath, "utf8");
    assert.match(source, /MaskingConfirmation/);
    assert.match(source, /shouldShowMaskingConfirmation/);
    assert.match(source, /copy\.consult\.maskingNotice/);
  });

  test("session placeholder exists as a navigation target without coaching UI", () => {
    assert.equal(existsSync(sessionPagePath), true);
    const source = readFileSync(sessionPagePath, "utf8");
    assert.match(source, /対話は次のタスク/);
    assert.match(source, /AppShell/);
    assert.match(source, /kind=["']standard["']/);
    assert.doesNotMatch(source, /ChatBubble/);
    assert.doesNotMatch(source, /Composer/);
    assert.doesNotMatch(source, /SCR-\d+/);
    assert.doesNotMatch(source, /5W3H/);
  });
});

async function loadModel(): Promise<typeof ConsultStartModel> {
  return import(pathToFileURL(modelPath).href) as Promise<typeof ConsultStartModel>;
}
