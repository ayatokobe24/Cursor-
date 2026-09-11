import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type * as ScriptEngineModule from "./script-engine";
import type * as ScriptsModule from "./scripts";

const dir = path.dirname(fileURLToPath(import.meta.url));
const enginePath = path.join(dir, "script-engine.ts");
const scriptsPath = path.join(dir, "scripts.ts");
const typesPath = path.join(dir, "types.ts");
const hookPath = path.join(dir, "use-advance-script.ts");
const statusPath = path.join(dir, "..", "screens", "coaching-script-status.tsx");
const sessionPagePath = path.join(
  dir,
  "..",
  "app",
  "consult",
  "[sessionId]",
  "page.tsx",
);

const NETWORK_PATTERN =
  /\bfetch\s*\(|\bopenai\b|\banthropic\b|\bXMLHttpRequest\b|\bWebSocket\b|api\.openai|api\.anthropic|generativelanguage|supabase\.functions|edge function/i;

describe("ScriptEngine (Requirement 1.1, 1.2, 5.4, 5.5)", () => {
  test("scripts.ts and script-engine.ts exist", () => {
    assert.equal(existsSync(scriptsPath), true);
    assert.equal(existsSync(enginePath), true);
  });

  test("types declare ScriptTurn and ScriptEngine.nextTurn", () => {
    const source = readFileSync(typesPath, "utf8");
    assert.match(source, /type ScriptTurn\s*=/);
    assert.match(source, /type ScriptEngine\s*=/);
    assert.match(source, /nextTurn\(/);
    assert.doesNotMatch(source, /\bany\b/);
  });

  test("fixture AI turns are Japanese coaching questions, one per turn, delay 200-400ms", async () => {
    const { DIALOGUE_TURNS, SCRIPT_DELAY_MS } = await loadScripts();

    assert.equal(SCRIPT_DELAY_MS >= 200, true);
    assert.equal(SCRIPT_DELAY_MS <= 400, true);
    assert.equal(DIALOGUE_TURNS.length >= 2, true);

    for (const turn of DIALOGUE_TURNS) {
      assert.equal(turn.speaker, "ai");
      assert.equal(turn.delayMs, SCRIPT_DELAY_MS);
      assert.match(turn.text, /か/);
      assert.doesNotMatch(turn.text, /\n/);
      assert.doesNotMatch(turn.text, /原因はこれです/);
      assert.doesNotMatch(turn.text, /5W3H/);
      assert.doesNotMatch(turn.text, /\bany\b/);
    }

    assert.equal(
      DIALOGUE_TURNS[0]?.text,
      "そのとき、具体的には何がありましたか。",
    );
  });

  test("nextTurn returns the next fixture turn without calling a network AI", async () => {
    const { createScriptEngine } = await loadEngine();
    const engine = createScriptEngine();

    const first = engine.nextTurn({
      sessionId: "session-1",
      coachStep: "dialogue",
    });
    assert.equal(first.ok, true);
    if (first.ok) {
      assert.equal(first.value.speaker, "ai");
      assert.equal(
        first.value.text,
        "そのとき、具体的には何がありましたか。",
      );
      assert.equal(first.value.delayMs >= 200, true);
      assert.equal(first.value.delayMs <= 400, true);
    }

    const second = engine.nextTurn({
      sessionId: "session-1",
      coachStep: "dialogue",
      userText: "うまくまとめられませんでした",
    });
    assert.equal(second.ok, true);
    if (second.ok) {
      assert.equal(second.value.speaker, "ai");
      assert.notEqual(
        second.value.text,
        "そのとき、具体的には何がありましたか。",
      );
      assert.notEqual(second.value.text, "うまくまとめられませんでした");
      assert.match(second.value.text, /か/);
    }
  });

  test("failure variant returns retryable SCRIPT_FAILED and does not consume the turn", async () => {
    const { createScriptEngine } = await loadEngine();
    const engine = createScriptEngine({ shouldFail: () => true });

    const failed = engine.nextTurn({
      sessionId: "session-1",
      coachStep: "dialogue",
      userText: "残したい入力",
    });
    assert.equal(failed.ok, false);
    if (!failed.ok) {
      assert.equal(failed.error.code, "SCRIPT_FAILED");
      assert.equal(failed.error.retryable, true);
      assert.match(failed.error.message, /入力はそのまま残して/);
    }

    const retryEngine = createScriptEngine({ shouldFail: () => false });
    const retried = retryEngine.nextTurn({
      sessionId: "session-1",
      coachStep: "dialogue",
      userText: "残したい入力",
    });
    assert.equal(retried.ok, true);
    if (retried.ok) {
      assert.equal(
        retried.value.text,
        "そのとき、具体的には何がありましたか。",
      );
    }
  });

  test("retainUserTextOnError keeps the draft unchanged", async () => {
    const { retainUserTextOnError } = await loadEngine();
    const draft = "送信前に書いておいた答え";
    assert.equal(retainUserTextOnError(draft), draft);
  });

  test("advanceScriptWithDelay sets isThinking, waits SCRIPT_DELAY_MS, then applies the turn", async () => {
    const { createScriptEngine, advanceScriptWithDelay, SCRIPT_DELAY_MS } =
      await loadEngine();
    const engine = createScriptEngine();
    const thinking: boolean[] = [];
    const order: string[] = [];
    let appliedText: string | null = null;

    const result = await advanceScriptWithDelay({
      delayMs: SCRIPT_DELAY_MS,
      applyTurn: () => {
        order.push("apply");
        const turn = engine.nextTurn({
          sessionId: "session-1",
          coachStep: "dialogue",
        });
        if (turn.ok) {
          appliedText = turn.value.text;
        }
        return turn;
      },
      setThinking: (value) => {
        thinking.push(value);
        order.push(value ? "thinking" : "idle");
      },
      wait: async (ms) => {
        assert.equal(ms, SCRIPT_DELAY_MS);
        assert.equal(ms >= 200, true);
        assert.equal(ms <= 400, true);
        order.push("wait");
      },
    });

    assert.equal(result.ok, true);
    assert.equal(appliedText, "そのとき、具体的には何がありましたか。");
    assert.deepEqual(thinking, [true, false]);
    assert.deepEqual(order, ["thinking", "wait", "apply", "idle"]);
  });

  test("advanceScriptWithDelay on error keeps draft and returns applyTurn Result", async () => {
    const { createScriptEngine, advanceScriptWithDelay, retainUserTextOnError, SCRIPT_DELAY_MS } =
      await loadEngine();
    const engine = createScriptEngine({ shouldFail: () => true });
    const draft = "消えてはいけない入力";
    const thinking: boolean[] = [];

    const result = await advanceScriptWithDelay({
      applyTurn: () =>
        engine.nextTurn({
          sessionId: "session-1",
          coachStep: "dialogue",
          userText: draft,
        }),
      setThinking: (value) => {
        thinking.push(value);
      },
      wait: async (ms) => {
        assert.equal(ms, SCRIPT_DELAY_MS);
        assert.equal(ms >= 200, true);
        assert.equal(ms <= 400, true);
      },
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "SCRIPT_FAILED");
      assert.equal(result.error.retryable, true);
    }
    assert.deepEqual(thinking, [true, false]);
    assert.equal(retainUserTextOnError(draft), draft);
  });

  test("script-engine and scripts have no generative-AI or fetch path", () => {
    const engineSource = readFileSync(enginePath, "utf8");
    const scriptsSource = readFileSync(scriptsPath, "utf8");
    assert.doesNotMatch(engineSource, NETWORK_PATTERN);
    assert.doesNotMatch(scriptsSource, NETWORK_PATTERN);
    assert.doesNotMatch(engineSource, /\bany\b/);
    assert.doesNotMatch(scriptsSource, /\bany\b/);
  });

  test("useAdvanceScript exposes isThinking during delay for later chat UI", () => {
    assert.equal(existsSync(hookPath), true);
    const source = readFileSync(hookPath, "utf8");
    assert.match(source, /useAdvanceScript/);
    assert.match(source, /isThinking/);
    assert.match(source, /advanceFromRuntime/);
    assert.match(source, /runtime\.advanceScript\(/);
    assert.doesNotMatch(source, /createScriptEngine\s*\(/);
    assert.doesNotMatch(source, NETWORK_PATTERN);
    assert.doesNotMatch(source, /\bany\b/);
    assert.doesNotMatch(source, /ChatBubble/);
  });

  test("placeholder coaching status can show 考えています without a chat layout", () => {
    assert.equal(existsSync(statusPath), true);
    const source = readFileSync(statusPath, "utf8");
    assert.match(source, /useAdvanceScript/);
    assert.match(source, /copy\.coaching\.thinking/);
    assert.match(source, /isThinking/);
    assert.doesNotMatch(source, /ChatBubble/);
    assert.doesNotMatch(source, /Composer/);
    assert.doesNotMatch(source, NETWORK_PATTERN);

    const pageSource = readFileSync(sessionPagePath, "utf8");
    assert.match(pageSource, /対話は次のタスク/);
    assert.match(pageSource, /CoachingScriptStatus/);
    assert.doesNotMatch(pageSource, /ChatBubble/);
    assert.doesNotMatch(pageSource, /Composer/);
  });
});

async function loadEngine(): Promise<typeof ScriptEngineModule> {
  return import(pathToFileURL(enginePath).href) as Promise<
    typeof ScriptEngineModule
  >;
}

async function loadScripts(): Promise<typeof ScriptsModule> {
  return import(pathToFileURL(scriptsPath).href) as Promise<
    typeof ScriptsModule
  >;
}
