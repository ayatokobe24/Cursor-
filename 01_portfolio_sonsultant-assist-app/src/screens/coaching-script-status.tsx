"use client";

import { copy } from "@/mock/copy";
import { useAdvanceScript } from "@/mock/use-advance-script";
import { useMockRuntime } from "@/mock/runtime";
import { InlineMessage } from "@/ui/primitives";

export function CoachingScriptStatus() {
  const runtime = useMockRuntime();
  const { isThinking, draft, setDraft, error, advance } = useAdvanceScript();
  const lastAi = [...runtime.state.messages]
    .reverse()
    .find((message) => message.speaker === "ai");

  return (
    <div>
      <label>
        いまの答え
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isThinking}
        />
      </label>
      <button
        type="button"
        onClick={() => {
          void advance();
        }}
        disabled={isThinking}
      >
        次の問い
      </button>
      {isThinking ? <p>{copy.coaching.thinking}</p> : null}
      {!isThinking && lastAi ? <p>{lastAi.text}</p> : null}
      {error ? (
        <InlineMessage
          onRetry={() => {
            void advance();
          }}
        >
          {error.message}
        </InlineMessage>
      ) : null}
    </div>
  );
}
