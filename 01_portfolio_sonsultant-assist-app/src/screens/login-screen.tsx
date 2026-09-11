"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { copy } from "@/mock/copy";
import { useMockRuntime } from "@/mock/runtime";
import {
  GlassCard,
  InlineMessage,
  PrimaryButton,
  SecondaryButton,
  TextField,
} from "@/ui/primitives";
import {
  isMockCredentialRejected,
  routeAfterSuccessfulSignIn,
} from "./login-model";
import styles from "./login-screen.module.css";

export function LoginScreen() {
  const runtime = useMockRuntime();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError(null);

    if (isMockCredentialRejected(password)) {
      setAuthError(copy.login.authFailed);
      return;
    }

    setSubmitting(true);
    const result = runtime.signIn();
    if (!result.ok) {
      setAuthError(result.error.message);
      setSubmitting(false);
      return;
    }

    router.push(routeAfterSuccessfulSignIn(runtime.state.auth.consented));
  }

  function handleRetry() {
    setAuthError(null);
  }

  return (
    <GlassCard size="large" className={styles.card}>
      <div className={styles.hero}>
        <h1 className={styles.serviceName}>{copy.login.serviceName}</h1>
        <p className={styles.summary}>{copy.login.summary}</p>
        <p className={styles.thirdParty}>{copy.login.thirdParty}</p>
        <p className={styles.anonymity}>{copy.login.anonymity}</p>
        <p className={styles.authNote}>{copy.login.authNote}</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} aria-busy={submitting}>
        <div className={styles.fields}>
          <TextField
            name="email"
            type="email"
            label={copy.login.emailLabel}
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={submitting}
          />
          <TextField
            name="password"
            type="password"
            label={copy.login.passwordLabel}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
          />
        </div>
        {authError ? (
          <InlineMessage onRetry={handleRetry}>{authError}</InlineMessage>
        ) : null}
        <PrimaryButton className={styles.cta} type="submit" disabled={submitting}>
          {copy.login.cta}
        </PrimaryButton>
      </form>
      <div className={styles.secondaryRow}>
        <SecondaryButton type="button">{copy.login.createAccount}</SecondaryButton>
        <SecondaryButton type="button">{copy.login.forgotPassword}</SecondaryButton>
      </div>
      <div className={styles.footerLinks}>
        <button type="button" className={styles.linkButton}>
          {copy.login.terms}
        </button>
        <button type="button" className={styles.linkButton}>
          {copy.login.privacy}
        </button>
      </div>
    </GlassCard>
  );
}
