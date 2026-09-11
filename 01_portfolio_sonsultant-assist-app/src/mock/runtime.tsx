"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createMockStore, type MockStore } from "./runtime-core";
import type { MockRuntime } from "./types";

const MockRuntimeContext = createContext<MockStore | null>(null);

export function MockRuntimeProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => createMockStore());

  useEffect(() => {
    store.attachStorage(window.sessionStorage);
    store.restoreFromStorage();
  }, [store]);

  return (
    <MockRuntimeContext.Provider value={store}>
      {children}
    </MockRuntimeContext.Provider>
  );
}

export function useMockRuntime(): MockRuntime {
  const store = useContext(MockRuntimeContext);
  if (store === null) {
    throw new Error("useMockRuntime must be used within MockRuntimeProvider");
  }

  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );

  return useMemo(
    () => ({
      get state() {
        return state;
      },
      applyScenario: store.applyScenario,
      setFeatureScope: store.setFeatureScope,
      setScreenVariant: store.setScreenVariant,
      signIn: store.signIn,
      completeConsent: store.completeConsent,
      startConsult: store.startConsult,
      appendUserMessage: store.appendUserMessage,
      beginOpeningTurn: store.beginOpeningTurn,
      advanceScript: store.advanceScript,
      requestCoachStep: store.requestCoachStep,
      confirmNextAction: store.confirmNextAction,
      startReflection: store.startReflection,
      interrupt: store.interrupt,
    }),
    [store, state],
  );
}
