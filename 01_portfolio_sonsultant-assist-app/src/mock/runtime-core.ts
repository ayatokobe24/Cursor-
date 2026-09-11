import type {
  CoachStep,
  FeatureScope,
  MockError,
  MockRuntime,
  MockRuntimeState,
  MockSession,
  MockSnapshot,
  Result,
  ScenarioId,
  ScrId,
} from "./types";
import {
  createScriptEngine,
  isScriptFailureVariant,
  SCRIPT_FAILED_ERROR,
} from "./script-engine.ts";

export const MOCK_SNAPSHOT_KEY = "banso-mock-runtime-snapshot";

export const COACH_STEP_ORDER: readonly CoachStep[] = [
  "dialogue",
  "organize",
  "hypothesis",
  "action",
  "confirm",
] as const;

export type SnapshotStorage = Pick<Storage, "getItem" | "setItem">;

export type CreateMockStoreOptions = {
  storage?: SnapshotStorage;
  restore?: boolean;
};

export type MockStore = MockRuntime & {
  subscribe(listener: () => void): () => void;
  getSnapshot(): MockRuntimeState;
  getServerSnapshot(): MockRuntimeState;
  attachStorage(storage: SnapshotStorage): void;
  restoreFromStorage(): void;
};

export function createInitialState(): MockRuntimeState {
  return {
    auth: { signedIn: false, consented: false },
    session: null,
    messages: [],
    coachStep: "dialogue",
    featureScope: "core",
    screenVariant: {},
    scenarioId: "first-login",
  };
}

export function saveSnapshot(
  state: MockRuntimeState,
  storage: SnapshotStorage,
): void {
  storage.setItem(MOCK_SNAPSHOT_KEY, JSON.stringify(state));
}

export function loadSnapshot(storage: SnapshotStorage): MockSnapshot | null {
  const raw = storage.getItem(MOCK_SNAPSHOT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return isMockRuntimeState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function createMockStore(
  options: CreateMockStoreOptions = {},
): MockStore {
  let storage = options.storage;
  let state = createInitialState();

  if (options.restore && storage) {
    const loaded = loadSnapshot(storage);
    if (loaded) {
      state = loaded;
    }
  }

  const listeners = new Set<() => void>();
  const scriptEngine = createScriptEngine({
    shouldFail: () => isScriptFailureVariant(state.screenVariant["SCR-004"]),
  });

  const emit = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  const setState = (next: MockRuntimeState): void => {
    state = next;
    emit();
  };

  const fail = (error: MockError): Result<void, MockError> => ({
    ok: false,
    error,
  });

  const succeed = (): Result<void, MockError> => ({
    ok: true,
    value: undefined,
  });

  const store: MockStore = {
    get state() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return state;
    },
    getServerSnapshot() {
      return state;
    },
    attachStorage(nextStorage) {
      storage = nextStorage;
    },
    restoreFromStorage() {
      if (!storage) {
        return;
      }
      const loaded = loadSnapshot(storage);
      if (loaded) {
        setState(loaded);
      }
    },
    applyScenario(id: ScenarioId) {
      if (id === "first-login") {
        setState(createInitialState());
        return;
      }
      setState({ ...state, scenarioId: id });
    },
    setFeatureScope(scope: FeatureScope) {
      setState({ ...state, featureScope: scope });
    },
    setScreenVariant(scr: ScrId, variant: string) {
      setState({
        ...state,
        screenVariant: { ...state.screenVariant, [scr]: variant },
      });
    },
    signIn() {
      const loginVariant = state.screenVariant["SCR-001"];
      if (loginVariant === "AUTH_FAILED" || loginVariant === "認証失敗") {
        return fail({
          code: "AUTH_FAILED",
          message:
            "ログインできませんでした。入力はそのまま残しています。もう一度試せます。",
          retryable: true,
        });
      }
      setState({
        ...state,
        auth: { ...state.auth, signedIn: true },
      });
      return succeed();
    },
    completeConsent() {
      setState({
        ...state,
        auth: { ...state.auth, consented: true },
      });
      return succeed();
    },
    startConsult(body: string) {
      const consultVariant = state.screenVariant["SCR-003"];
      if (
        consultVariant === "START_FAILED" ||
        consultVariant === "失敗" ||
        consultVariant === "失敗（入力保持）"
      ) {
        return {
          ok: false as const,
          error: {
            code: "LOAD_FAILED" as const,
            message:
              "相談を始められませんでした。入力はそのまま残しています。もう一度試せます。",
            retryable: true,
          },
        };
      }
      const session: MockSession = {
        id: "session-1",
        consultBody: body,
        messages: [],
        coachStep: "dialogue",
        status: "consulting",
        nextAction: null,
        reflection: null,
      };
      setState({
        ...state,
        session,
        messages: [],
        coachStep: "dialogue",
      });
      scriptEngine.reset(session.id);
      return { ok: true, value: session.id };
    },
    advanceScript() {
      if (!state.session) {
        return fail(SCRIPT_FAILED_ERROR);
      }
      const result = scriptEngine.nextTurn({
        sessionId: state.session.id,
        coachStep: state.coachStep,
      });
      if (!result.ok) {
        return result;
      }
      const message = {
        speaker: result.value.speaker,
        text: result.value.text,
      };
      const messages = [...state.messages, message];
      setState({
        ...state,
        messages,
        session: { ...state.session, messages },
      });
      return succeed();
    },
    requestCoachStep(step: CoachStep) {
      if (isFutureStep(state.coachStep, step)) {
        return fail({
          code: "INVALID_STEP",
          message: "まだ先のステップには進めません。",
          retryable: false,
        });
      }
      setState({
        ...state,
        coachStep: step,
        session: state.session
          ? { ...state.session, coachStep: step }
          : null,
      });
      return succeed();
    },
    confirmNextAction() {
      if (!state.session) {
        return fail({
          code: "INVALID_STEP",
          message: "確定できる相談がありません。",
          retryable: false,
        });
      }
      setState({
        ...state,
        session: { ...state.session, status: "awaiting_execution" },
      });
      return succeed();
    },
    startReflection() {
      if (!state.session) {
        return fail({
          code: "INVALID_STEP",
          message: "振り返れる相談がありません。",
          retryable: false,
        });
      }
      setState({
        ...state,
        session: { ...state.session, status: "awaiting_reflection" },
      });
      return succeed();
    },
    interrupt() {
      if (!storage) {
        return;
      }
      saveSnapshot(state, storage);
    },
  };

  return store;
}

function isFutureStep(current: CoachStep, requested: CoachStep): boolean {
  return COACH_STEP_ORDER.indexOf(requested) > COACH_STEP_ORDER.indexOf(current);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCoachStep(value: unknown): value is CoachStep {
  return (
    value === "dialogue" ||
    value === "organize" ||
    value === "hypothesis" ||
    value === "action" ||
    value === "confirm"
  );
}

function isMockRuntimeState(value: unknown): value is MockRuntimeState {
  if (!isRecord(value) || !isRecord(value.auth)) {
    return false;
  }
  if (
    typeof value.auth.signedIn !== "boolean" ||
    typeof value.auth.consented !== "boolean"
  ) {
    return false;
  }
  if (value.featureScope !== "core" && value.featureScope !== "extended") {
    return false;
  }
  if (
    value.scenarioId !== "first-login" &&
    value.scenarioId !== "consented" &&
    value.scenarioId !== "in-progress" &&
    value.scenarioId !== "awaiting-execution" &&
    value.scenarioId !== "awaiting-reflection"
  ) {
    return false;
  }
  if (!isCoachStep(value.coachStep) || !Array.isArray(value.messages)) {
    return false;
  }
  if (value.session !== null && !isRecord(value.session)) {
    return false;
  }
  return true;
}
