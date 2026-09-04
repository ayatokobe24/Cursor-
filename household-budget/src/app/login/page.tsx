import Link from "next/link";
import { signIn } from "@/actions/auth";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">ログイン</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        メールとパスワードで家計簿に入ります。
      </p>
      <AuthForm mode="login" submitAuth={signIn} />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        アカウントがない場合は{" "}
        <Link href="/signup" className="font-medium underline">
          登録
        </Link>
      </p>
    </main>
  );
}
