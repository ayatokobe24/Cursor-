"use client";

import { useCallback, useState } from "react";
import { useMockRuntime } from "./runtime";
import { advanceFromRuntime } from "./script-engine";
import type { MockError, Result } from "./types";

export function useAdvanceScript() {
  const runtime = useMockRuntime();
  const [isThinking, setIsThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<MockError | null>(null);

  const advance = useCallback(async (): Promise<Result<void, MockError>> => {
    setError(null);
    const keptDraft = draft;
    setDraft("");
    const { result, draft: nextDraft } = await advanceFromRuntime({
      advanceScript: () => runtime.advanceScript(),
      draft: keptDraft,
      setThinking: setIsThinking,
    });
    setDraft(nextDraft);
    if (!result.ok) {
      setError(result.error);
    }
    return result;
  }, [draft, runtime]);

  return { isThinking, draft, setDraft, error, advance };
}
