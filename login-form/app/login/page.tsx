"use client";

import { FormEvent } from "react";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <main className="flex h-full w-full items-center justify-center bg-[var(--surface-primary)] p-12">
      <form
        onSubmit={handleSubmit}
        className="flex w-[420px] flex-col gap-[28px] rounded-[var(--radius-2xl)] bg-[var(--surface-card)] p-10 shadow-[0_1px_3px_#00000008,0_4px_12px_#0000000a]"
      >
        <header className="flex w-full flex-col gap-[10px]">
          <div className="flex items-center gap-2">
            <span className="font-heading text-[18px] font-semibold text-[var(--accent-primary)]">
              +
            </span>
            <span className="font-body text-[11px] font-medium tracking-[1.6px] text-[var(--foreground-muted)]">
              ACCOUNT
            </span>
          </div>
          <h1 className="font-heading text-[32px] font-semibold text-[var(--foreground-primary)]">
            ログイン
          </h1>
          <p className="font-body text-[14px] leading-[1.5] font-normal text-[var(--foreground-secondary)]">
            メールアドレスとパスワードを入力してください
          </p>
        </header>

        <div className="flex w-full flex-col gap-4">
          <label className="flex w-full flex-col gap-2">
            <span className="font-body text-[13px] font-medium text-[var(--foreground-primary)]">
              メールアドレス
            </span>
            <span className="flex h-12 w-full items-center gap-[10px] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--input-fill)] px-[14px]">
              <Mail
                className="h-[18px] w-[18px] shrink-0 text-[var(--foreground-muted)]"
                strokeWidth={1.75}
                aria-hidden
              />
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-full w-full bg-transparent font-body text-[14px] font-normal text-[var(--foreground-primary)] outline-none placeholder:text-[var(--foreground-muted)]"
              />
            </span>
          </label>

          <label className="flex w-full flex-col gap-2">
            <span className="font-body text-[13px] font-medium text-[var(--foreground-primary)]">
              パスワード
            </span>
            <span className="flex h-12 w-full items-center gap-[10px] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--input-fill)] px-[14px]">
              <Lock
                className="h-[18px] w-[18px] shrink-0 text-[var(--foreground-muted)]"
                strokeWidth={1.75}
                aria-hidden
              />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-full w-full bg-transparent font-body text-[14px] font-normal text-[var(--foreground-primary)] outline-none placeholder:text-[var(--foreground-muted)]"
              />
            </span>
          </label>
        </div>

        <div className="flex w-full flex-col items-center gap-[14px]">
          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-[var(--radius-xl)] bg-[var(--surface-inverse)] font-body text-[15px] font-semibold text-[var(--foreground-inverse)]"
          >
            ログイン
          </button>
          <a
            href="#"
            className="font-body text-[13px] font-normal text-[var(--accent-primary)] underline"
          >
            パスワードを忘れた方
          </a>
        </div>
      </form>
    </main>
  );
}
