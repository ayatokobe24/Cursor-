import Link from "next/link";
import { signUp } from "@/actions/auth";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">登録</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        メールとパスワードでアカウントを作ります。
      </p>
      <AuthForm mode="signup" submitAuth={signUp} />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        すでにアカウントがある場合は{" "}
        <Link href="/login" className="font-medium underline">
          ログイン
        </Link>
      </p>
    </main>
  );
}
