import { err, ok, type Result } from "@/lib/result";
import type { AuthError } from "./types";

type AuthErrorLike = { message: string; code?: string } | null;

export type PasswordAuthClient = {
  auth: {
    signInWithPassword: (credentials: {
      email: string;
      password: string;
    }) => Promise<{
      data: { session: unknown; user: unknown };
      error: AuthErrorLike;
    }>;
    signUp: (credentials: {
      email: string;
      password: string;
    }) => Promise<{
      data: { session: unknown; user: unknown };
      error: AuthErrorLike;
    }>;
    signOut: () => Promise<{ error: AuthErrorLike }>;
  };
};

function isInvalidCredentials(error: NonNullable<AuthErrorLike>): boolean {
  return (
    error.code === "invalid_credentials" ||
    /invalid login credentials/i.test(error.message)
  );
}

export async function signInWithPassword(
  client: PasswordAuthClient,
  email: string,
  password: string,
): Promise<Result<{ redirectTo: "/" }, AuthError>> {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (isInvalidCredentials(error)) {
      return err({ kind: "invalidCredentials" });
    }
    return err({ kind: "unavailable", message: "ログインできませんでした" });
  }

  if (!data.session) {
    return err({ kind: "unavailable", message: "セッションを確立できませんでした" });
  }

  return ok({ redirectTo: "/" });
}

export async function signUpWithPassword(
  client: PasswordAuthClient,
  email: string,
  password: string,
): Promise<Result<{ redirectTo: "/" }, AuthError>> {
  const { data, error } = await client.auth.signUp({ email, password });

  if (error) {
    return err({ kind: "unavailable", message: "登録できませんでした" });
  }

  if (!data.session) {
    return err({
      kind: "unavailable",
      message: "確認メールのあとでログインしてください",
    });
  }

  return ok({ redirectTo: "/" });
}

export async function signOutSession(
  client: PasswordAuthClient,
): Promise<Result<{ redirectTo: "/login" }, AuthError>> {
  const { error } = await client.auth.signOut();
  if (error) {
    return err({ kind: "unavailable", message: "ログアウトできませんでした" });
  }
  return ok({ redirectTo: "/login" });
}
