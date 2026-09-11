import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type * as RuntimeCore from "./runtime-core";

const dir = path.dirname(fileURLToPath(import.meta.url));
const runtimePath = path.join(dir, "runtime.tsx");
const typesPath = path.join(dir, "types.ts");
const corePath = path.join(dir, "runtime-core.ts");

describe("MockRuntime (Requirement 1.2, 1.4, 1.5)", () => {
  test("src/mock/runtime.tsx exists", () => {
    assert.equal(existsSync(runtimePath), true);
  });

  test("src/mock/types.ts declares FeatureScope, CoachStep, MockError, Result", () => {
    assert.equal(existsSync(typesPath), true);
    const source = readFileSync(typesPath, "utf8");
    assert.match(source, /type FeatureScope\s*=\s*"core"\s*\|\s*"extended"/);
    assert.match(source, /type CoachStep\s*=/);
    assert.match(source, /type MockError\s*=/);
    assert.match(source, /type Result\s*</);
    assert.doesNotMatch(source, /\bany\b/);
  });

  test("Provider and hook are exported from runtime.tsx", () => {
    const source = readFileSync(runtimePath, "utf8");
    assert.match(source, /MockRuntimeProvider/);
    assert.match(source, /useMockRuntime/);
    assert.match(source, /['"]use client['"]/);
  });

  test("initial state is unsigned, unconsented, core, first-login, no session", async () => {
    const { createMockStore } = await loadCore();
    const store = createMockStore();

    assert.equal(store.state.auth.signedIn, false);
    assert.equal(store.state.auth.consented, false);
    assert.equal(store.state.session, null);
    assert.equal(store.state.featureScope, "core");
    assert.equal(store.state.scenarioId, "first-login");
    assert.equal(store.state.coachStep, "dialogue");
    assert.deepEqual(store.state.messages, []);
  });

  test("setFeatureScope updates scope without touching auth", async () => {
    const { createMockStore } = await loadCore();
    const store = createMockStore();
    store.setFeatureScope("extended");
    assert.equal(store.state.featureScope, "extended");
    assert.equal(store.state.auth.signedIn, false);
  });

  test("advanceScript returns SCRIPT_FAILED until ScriptEngine exists", async () => {
    const { createMockStore } = await loadCore();
    const store = createMockStore();
    const result = store.advanceScript();
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "SCRIPT_FAILED");
      assert.equal(result.error.retryable, true);
    }
  });

  test("requestCoachStep rejects a future step", async () => {
    const { createMockStore } = await loadCore();
    const store = createMockStore();
    const result = store.requestCoachStep("organize");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "INVALID_STEP");
    }
    assert.equal(store.state.coachStep, "dialogue");
  });

  test("interrupt saves a snapshot that later restores", async () => {
    const { createMockStore, loadSnapshot } = await loadCore();
    const storage = memoryStorage();
    const store = createMockStore({ storage });
    store.setFeatureScope("extended");
    store.interrupt();

    const snapshot = loadSnapshot(storage);
    assert.equal(snapshot?.featureScope, "extended");

    const restored = createMockStore({ storage, restore: true });
    assert.equal(restored.state.featureScope, "extended");
  });
});

async function loadCore(): Promise<typeof RuntimeCore> {
  return import(pathToFileURL(corePath).href) as Promise<typeof RuntimeCore>;
}

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, String(value));
    },
  };
}
