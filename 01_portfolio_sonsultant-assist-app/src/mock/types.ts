export type FeatureScope = "core" | "extended";

export type CoachStep =
  | "dialogue"
  | "organize"
  | "hypothesis"
  | "action"
  | "confirm";

export type ScrId =
  | "SCR-001"
  | "SCR-002"
  | "SCR-003"
  | "SCR-004"
  | "SCR-005"
  | "SCR-006"
  | "SCR-007"
  | "SCR-008"
  | "SCR-009"
  | "SCR-010"
  | "SCR-011"
  | "SCR-012"
  | "SCR-013"
  | "SCR-014"
  | "SCR-015"
  | "SCR-016"
  | "SCR-017"
  | "SCR-018"
  | "SCR-019"
  | "SCR-020"
  | "SCR-021"
  | "SCR-022";

export type ScenarioId =
  | "first-login"
  | "consented"
  | "in-progress"
  | "awaiting-execution"
  | "awaiting-reflection";

export type MockError = {
  code: "AUTH_FAILED" | "SCRIPT_FAILED" | "LOAD_FAILED" | "INVALID_STEP";
  message: string;
  retryable: boolean;
};

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type SessionStatus =
  | "consulting"
  | "awaiting_execution"
  | "awaiting_reflection"
  | "complete";

export type CoachMessage = {
  speaker: "ai" | "user";
  text: string;
};

export type ScriptTurn = {
  speaker: "ai" | "user";
  text: string;
  delayMs: number;
};

export type ScriptEngine = {
  nextTurn(input: {
    sessionId: string;
    coachStep: CoachStep;
    userText?: string;
  }): Result<ScriptTurn, MockError>;
};

export type MockSession = {
  id: string;
  consultBody: string;
  messages: CoachMessage[];
  coachStep: CoachStep;
  status: SessionStatus;
  nextAction: string | null;
  reflection: string | null;
};

export type AuthState = {
  signedIn: boolean;
  consented: boolean;
};

export type MockRuntimeState = {
  auth: AuthState;
  session: MockSession | null;
  messages: CoachMessage[];
  coachStep: CoachStep;
  featureScope: FeatureScope;
  screenVariant: Partial<Record<ScrId, string>>;
  scenarioId: ScenarioId;
};

export type MockSnapshot = MockRuntimeState;

export type MockRuntime = {
  readonly state: MockRuntimeState;
  applyScenario(id: ScenarioId): void;
  setFeatureScope(scope: FeatureScope): void;
  setScreenVariant(scr: ScrId, variant: string): void;
  signIn(): Result<void, MockError>;
  completeConsent(): Result<void, MockError>;
  startConsult(body: string): Result<string, MockError>;
  appendUserMessage(text: string): Result<void, MockError>;
  beginOpeningTurn(): boolean;
  advanceScript(): Result<void, MockError>;
  requestCoachStep(step: CoachStep): Result<void, MockError>;
  confirmNextAction(): Result<void, MockError>;
  startReflection(): Result<void, MockError>;
  interrupt(): void;
};
