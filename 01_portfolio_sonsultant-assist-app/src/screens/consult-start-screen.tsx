"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { copy } from "@/mock/copy";
import { useMockRuntime } from "@/mock/runtime";
import {
  GlassCard,
  InlineMessage,
  PrimaryButton,
  Textarea,
} from "@/ui/primitives";
import {
  canStartConsultAfterMasking,
  consultScreenVariant,
  mockMaskedPreview,
  retainConsultBody,
  routeAfterConsultStart,
  shouldNavigateAfterStart,
  shouldShowMaskingConfirmation,
} from "./consult-start-model";
import styles from "./consult-start-screen.module.css";

export function ConsultStartScreen() {
  const runtime = useMockRuntime();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [maskingAcknowledged, setMaskingAcknowledged] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const variant = consultScreenVariant(runtime.state.screenVariant);
  const showMasking = shouldShowMaskingConfirmation(body, variant);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStartError(null);

    if (!canStartConsultAfterMasking(showMasking, maskingAcknowledged)) {
      return;
    }

    const preserved = retainConsultBody(body);
    setSubmitting(true);
    const result = runtime.startConsult(preserved);
    if (!shouldNavigateAfterStart(result)) {
      setStartError(result.error.message);
      setSubmitting(false);
      return;
    }

    router.push(routeAfterConsultStart(result.value));
  }

  function handleRetry() {
    setStartError(null);
  }

  return (
    <GlassCard size="large" className={styles.card}>
      <div className={styles.hero}>
        <h1 className={styles.title}>{copy.consult.title}</h1>
        <p className={styles.reassurance}>{copy.consult.reassurance}</p>
        <p className={styles.confidentiality}>{copy.consult.confidentiality}</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} aria-busy={submitting}>
        <Textarea
          name="consult-body"
          className={styles.bodyField}
          label={copy.consult.hint}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          disabled={submitting}
        />
        {showMasking ? (
          <MaskingConfirmation
            preview={mockMaskedPreview(body)}
            acknowledged={maskingAcknowledged}
            disabled={submitting}
            onAcknowledgeChange={setMaskingAcknowledged}
          />
        ) : null}
        {startError ? (
          <InlineMessage onRetry={handleRetry}>{startError}</InlineMessage>
        ) : null}
        <PrimaryButton className={styles.cta} type="submit" disabled={submitting}>
          {copy.consult.cta}
        </PrimaryButton>
      </form>
    </GlassCard>
  );
}

type MaskingConfirmationProps = {
  preview: string;
  acknowledged: boolean;
  disabled: boolean;
  onAcknowledgeChange: (acknowledged: boolean) => void;
};

function MaskingConfirmation({
  preview,
  acknowledged,
  disabled,
  onAcknowledgeChange,
}: MaskingConfirmationProps) {
  return (
    <div className={styles.masking}>
      <p className={styles.maskingNotice}>{copy.consult.maskingNotice}</p>
      {preview.trim() ? (
        <p className={styles.maskingPreview}>{preview}</p>
      ) : null}
      <div className={styles.ackRow}>
        <input
          id="masking-ack"
          className={styles.checkbox}
          type="checkbox"
          name="masking-ack"
          checked={acknowledged}
          disabled={disabled}
          onChange={(event) => onAcknowledgeChange(event.target.checked)}
        />
        <label className={styles.ackLabel} htmlFor="masking-ack">
          {copy.consult.maskingAck}
        </label>
      </div>
    </div>
  );
}
