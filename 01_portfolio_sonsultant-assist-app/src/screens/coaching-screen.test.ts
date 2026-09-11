import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const screenPath = path.join(dir, "coaching-screen.tsx");
const stylesPath = path.join(dir, "coaching-screen.module.css");
const pagePath = path.join(dir, "..", "app", "consult", "[sessionId]", "page.tsx");
const bubblePath = path.join(dir, "..", "ui", "primitives", "chat-bubble.tsx");
const primitivesCssPath = path.join(
  dir,
  "..",
  "ui",
  "primitives",
  "primitives.module.css",
);
const primitivesIndexPath = path.join(dir, "..", "ui", "primitives", "index.ts");
const typesPath = path.join(dir, "..", "mock", "types.ts");
const corePath = path.join(dir, "..", "mock", "runtime-core.ts");
const runtimePath = path.join(dir, "..", "mock", "runtime.tsx");

const NETWORK_PATTERN =
  /\bfetch\s*\(|\bopenai\b|\banthropic\b|\bXMLHttpRequest\b|\bWebSocket\b|api\.openai|api\.anthropic|generativelanguage|supabase\.functions|edge function/i;

describe("CoachingScreen (Requirement 2.3, 5.2, 5.3)", () => {
  test("ChatBubble primitive exists with left/right speakers and 78% max-width", () => {
    assert.equal(existsSync(bubblePath), true);
    const source = readFileSync(bubblePath, "utf8");
    assert.match(source, /export function ChatBubble/);
    assert.match(source, /data-primitive=["']ChatBubble["']/);
    assert.match(source, /speaker/);
    assert.doesNotMatch(source, /\bany\b/);
    assert.doesNotMatch(source, NETWORK_PATTERN);

    const index = readFileSync(primitivesIndexPath, "utf8");
    assert.match(index, /export \{ ChatBubble \}/);

    const css = readFileSync(primitivesCssPath, "utf8");
    assert.match(css, /max-width:\s*78%/);
    assert.match(css, /chatBubbleAi|\[data-speaker=["']ai["']\]/);
    assert.match(css, /chatBubbleUser|\[data-speaker=["']user["']\]/);
  });

  test("consult session page wires CoachingScreen only, with AppShell standard", () => {
    assert.equal(existsSync(pagePath), true);
    const source = readFileSync(pagePath, "utf8");
    assert.match(source, /CoachingScreen/);
    assert.match(source, /from ["']@\/screens\/coaching-screen["']/);
    assert.match(source, /AppShell/);
    assert.match(source, /kind=["']standard["']/);
    assert.match(source, /currentStep=["']consult["']/);
    assert.doesNotMatch(source, /対話は次のタスク/);
    assert.doesNotMatch(source, /CoachingScriptStatus/);
    assert.doesNotMatch(source, /ChatBubble/);
    assert.doesNotMatch(source, /Composer/);
    assert.doesNotMatch(source, /PrimaryButton/);
    assert.doesNotMatch(source, /SCR-\d+/);
    assert.doesNotMatch(source, /5W3H/);
  });

  test("coaching screen shows AI left / user right bubbles and a sticky Composer", () => {
    assert.equal(existsSync(screenPath), true);
    const source = readFileSync(screenPath, "utf8");
    assert.match(source, /['"]use client['"]/);
    assert.match(source, /ChatBubble/);
    assert.match(source, /Composer/);
    assert.match(source, /useAdvanceScript/);
    assert.match(source, /copy\.coaching\.thinking/);
    assert.match(source, /appendUserMessage/);
    assert.match(source, /beginOpeningTurn/);
    assert.match(source, /messages\.map/);
    assert.match(source, /speaker=["']\{message\.speaker\}["']|speaker=\{message\.speaker\}/);
    assert.match(source, /scrollIntoView/);
    assert.doesNotMatch(source, /PrimaryButton/);
    assert.doesNotMatch(source, /RelatedKnowledgeCard/);
    assert.doesNotMatch(source, /保存して、あとで続ける/);
    assert.doesNotMatch(source, /5W3H/);
    assert.doesNotMatch(source, /\bany\b/);
    assert.doesNotMatch(source, NETWORK_PATTERN);
  });

  test("coaching layout keeps the thread scrollable and the composer docked", () => {
    assert.equal(existsSync(stylesPath), true);
    const css = readFileSync(stylesPath, "utf8");
    assert.match(css, /position:\s*sticky/);
    assert.match(css, /overflow-y:\s*auto/);
    assert.match(css, /justify-content:\s*flex-start/);
    assert.match(css, /justify-content:\s*flex-end/);
  });

  test("runtime records a user bubble without calling a network model", () => {
    const types = readFileSync(typesPath, "utf8");
    assert.match(types, /appendUserMessage\(text: string\)/);

    const core = readFileSync(corePath, "utf8");
    assert.match(core, /appendUserMessage\(/);
    assert.doesNotMatch(core, NETWORK_PATTERN);

    const runtime = readFileSync(runtimePath, "utf8");
    assert.match(runtime, /appendUserMessage: store\.appendUserMessage/);
  });
});
