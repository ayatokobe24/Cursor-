"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import type { Result } from "@/lib/result";
import type { AuthError } from "@/lib/auth/types";

type AuthFormProps = {
  mode: "login" | "signup";
  submitAuth: (
    email: string,
    password: string,
  ) => Promise<Result<{ redirectTo: "/" }, AuthError>>;
};

function errorMessage(error: AuthError): string {
  if (error.kind === "invalidCredentials") {
    return "メールまたはパスワードが正しくありません";
  }
  return error.message;
}

export function AuthForm({ mode, submitAuth }: AuthFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const submitLabel = mode === "login" ? "ログイン" : "登録";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    startTransition(async () => {
      const result = await submitAuth(email, password);
      if (!result.ok) {
        setMessage(errorMessage(result.error));
        return;
      }
      setMessage(null);
      router.push(result.value.redirectTo);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          メール
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 rounded-lg border border-zinc-300 bg-transparent px-3"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          className="h-12 rounded-lg border border-zinc-300 bg-transparent px-3"
        />
      </div>
      {message ? (
        <p role="alert" className="text-sm text-zinc-600 dark:text-zinc-400">
          {message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="h-12 rounded-lg bg-zinc-950 font-medium text-white disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {submitLabel}
      </button>
    </form>
  );
}
