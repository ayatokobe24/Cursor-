"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { copy } from "@/mock/copy";
import { useMockRuntime } from "@/mock/runtime";
import { GlassCard, PrimaryButton } from "@/ui/primitives";
import {
  REQUIRED_CONSENT_IDS,
  createInitialConsentChecks,
  isConsentReady,
  routeAfterConsent,
  toggleConsentCheck,
  type ConsentItemId,
} from "./consent-model";
import styles from "./consent-screen.module.css";

export function ConsentScreen() {
  const runtime = useMockRuntime();
  const router = useRouter();
  const [checks, setChecks] = useState(createInitialConsentChecks);
  const ready = isConsentReady(checks);

  function handleToggle(id: ConsentItemId) {
    setChecks((current) => toggleConsentCheck(current, id));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isConsentReady(checks)) {
      return;
    }

    const result = runtime.completeConsent();
    if (!result.ok) {
      return;
    }

    router.push(routeAfterConsent());
  }

  return (
    <GlassCard size="large" className={styles.card}>
      <div className={styles.hero}>
        <h1 className={styles.title}>{copy.consent.title}</h1>
        <p className={styles.description}>{copy.consent.description}</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <ul className={styles.items}>
          {REQUIRED_CONSENT_IDS.map((id) => (
            <ConsentItem
              key={id}
              id={id}
              label={copy.consent.items[id]}
              checked={checks[id]}
              onToggle={handleToggle}
            />
          ))}
        </ul>
        <p className={styles.publicNote}>{copy.consent.publicNote}</p>
        <PrimaryButton
          className={styles.cta}
          type="submit"
          disabled={!ready}
        >
          {copy.consent.cta}
        </PrimaryButton>
        {ready ? null : (
          <p className={styles.disabledReason} role="status">
            {copy.consent.disabledReason}
          </p>
        )}
      </form>
    </GlassCard>
  );
}

type ConsentItemProps = {
  id: ConsentItemId;
  label: string;
  checked: boolean;
  onToggle: (id: ConsentItemId) => void;
};

function ConsentItem({ id, label, checked, onToggle }: ConsentItemProps) {
  const inputId = `consent-${id}`;

  return (
    <li className={styles.item}>
      <input
        id={inputId}
        className={styles.checkbox}
        type="checkbox"
        name={id}
        checked={checked}
        onChange={() => onToggle(id)}
      />
      <label className={styles.itemLabel} htmlFor={inputId}>
        {label}
      </label>
    </li>
  );
}
