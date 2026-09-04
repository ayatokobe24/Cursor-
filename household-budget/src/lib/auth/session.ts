import type { AppError } from "@/lib/transactions/types";
import { err, ok, type Result } from "@/lib/result";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SessionUser } from "./types";

type AuthUserLike = {
  id: string;
  email?: string | null;
};

export function toSessionUser(user: AuthUserLike): SessionUser {
  return {
    userId: user.id,
    email: user.email ?? "",
  };
}

export async function requireUserFromGetUser(
  getUser: () => Promise<{
    data: { user: AuthUserLike | null };
    error: unknown;
  }>,
): Promise<Result<SessionUser, AppError>> {
  const { data, error } = await getUser();
  if (error || !data.user) {
    return err({ kind: "unauthenticated" });
  }
  return ok(toSessionUser(data.user));
}

export async function requireUser() {
  const supabase = await createServerSupabaseClient();
  return requireUserFromGetUser(() => supabase.auth.getUser());
}
