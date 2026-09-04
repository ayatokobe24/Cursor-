import { NextResponse } from "next/server";
import { completeAuthCallback } from "@/lib/auth/callback";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const supabase = await createServerSupabaseClient();
  const pathname = await completeAuthCallback(code, (authCode) =>
    supabase.auth.exchangeCodeForSession(authCode),
  );

  return NextResponse.redirect(new URL(pathname, requestUrl.origin));
}
