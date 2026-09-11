import type { CoachStep, ScriptTurn } from "./types";

export const SCRIPT_DELAY_MS = 300;

function aiTurn(text: string): ScriptTurn {
  return {
    speaker: "ai",
    text,
    delayMs: SCRIPT_DELAY_MS,
  };
}

export const DIALOGUE_TURNS: readonly ScriptTurn[] = [
  aiTurn("そのとき、具体的には何がありましたか。"),
  aiTurn("いま、いちばん引っかかっているのはどこですか。"),
  aiTurn("それが続くと、どんなことが困りますか。"),
  aiTurn("いまの状況を、自分ではどう受け止めていますか。"),
  aiTurn("ここまでの話を、あとで一緒に整理できますか。"),
];

export const TURNS_BY_STEP: Record<CoachStep, readonly ScriptTurn[]> = {
  dialogue: DIALOGUE_TURNS,
  organize: [aiTurn("いま話したことを、事実と受け止め方に分けてみてよいですか。")],
  hypothesis: [aiTurn("考えられる仮説を、いくつか並べてみてもよいですか。")],
  action: [aiTurn("いま試せそうな一歩は、どれに近いですか。")],
  confirm: [aiTurn("いつ、どの場面で、何を試すかを確認してもよいですか。")],
};
