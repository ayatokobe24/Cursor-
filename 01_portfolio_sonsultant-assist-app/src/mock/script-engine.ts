import { SCRIPT_DELAY_MS, TURNS_BY_STEP } from "./scripts.ts";
import type { MockError, Result, ScriptEngine } from "./types";

export { SCRIPT_DELAY_MS };

export const SCRIPT_FAILED_ERROR: MockError = {
  code: "SCRIPT_FAILED",
  message: "もう一度聞いてみますか。いまの入力はそのまま残しています。",
  retryable: true,
};

export type ScriptEngineHandle = ScriptEngine & {
  reset(sessionId: string): void;
};

export type ScriptEngineOptions = {
  shouldFail?: () => boolean;
};

export type AdvanceScriptWithDelayParams<T> = {
  applyTurn: () => Result<T, MockError>;
  setThinking: (value: boolean) => void;
  wait?: (ms: number) => Promise<void>;
  delayMs?: number;
};

export function isScriptFailureVariant(variant: string | undefined): boolean {
  return (
    variant === "SCRIPT_FAILED" ||
    variant === "処理失敗" ||
    variant === "AI処理失敗"
  );
}

export function retainUserTextOnError(userText: string): string {
  return userText;
}

export function createScriptEngine(
  options: ScriptEngineOptions = {},
): ScriptEngineHandle {
  const cursor = new Map<string, number>();

  return {
    reset(sessionId: string) {
      cursor.set(sessionId, 0);
    },
    nextTurn(input) {
      if (options.shouldFail?.() || input.sessionId.length === 0) {
        return { ok: false, error: SCRIPT_FAILED_ERROR };
      }

      const turns = TURNS_BY_STEP[input.coachStep];
      const index = cursor.get(input.sessionId) ?? 0;
      const turn = turns[Math.min(index, turns.length - 1)];
      if (!turn) {
        return { ok: false, error: SCRIPT_FAILED_ERROR };
      }

      cursor.set(input.sessionId, index + 1);
      return { ok: true, value: turn };
    },
  };
}

export async function advanceScriptWithDelay<T>(
  params: AdvanceScriptWithDelayParams<T>,
): Promise<Result<T, MockError>> {
  params.setThinking(true);
  await (params.wait ?? sleep)(params.delayMs ?? SCRIPT_DELAY_MS);
  const result = params.applyTurn();
  params.setThinking(false);
  return result;
}

export async function advanceFromRuntime(params: {
  advanceScript: () => Result<void, MockError>;
  draft: string;
  setThinking: (value: boolean) => void;
  wait?: (ms: number) => Promise<void>;
}): Promise<{ result: Result<void, MockError>; draft: string }> {
  const keptDraft = retainUserTextOnError(params.draft);
  const result = await advanceScriptWithDelay({
    applyTurn: params.advanceScript,
    setThinking: params.setThinking,
    wait: params.wait,
    delayMs: SCRIPT_DELAY_MS,
  });
  if (!result.ok) {
    return { result, draft: keptDraft };
  }
  return { result, draft: "" };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
