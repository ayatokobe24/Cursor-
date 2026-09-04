"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AuthError } from "@/lib/auth/types";
import type { Result } from "@/lib/result";

type LogoutButtonProps = {
  signOut: () => Promise<Result<{ redirectTo: "/login" }, AuthError>>;
};

export function LogoutButton({ signOut }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const result = await signOut();
      if (!result.ok) {
        setMessage(
          result.error.kind === "unavailable"
            ? result.error.message
            : "ログアウトできませんでした",
        );
        return;
      }
      router.push(result.value.redirectTo);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-sm font-medium underline disabled:opacity-50"
      >
        ログアウト
      </button>
      {message ? (
        <p role="alert" className="text-sm text-zinc-600">
          {message}
        </p>
      ) : null}
    </div>
  );
}
