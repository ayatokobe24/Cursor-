"use server";

import {
  signInWithPassword,
  signOutSession,
  signUpWithPassword,
} from "@/lib/auth/service";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signIn(email: string, password: string) {
  const supabase = await createServerSupabaseClient();
  return signInWithPassword(supabase, email, password);
}

export async function signUp(email: string, password: string) {
  const supabase = await createServerSupabaseClient();
  return signUpWithPassword(supabase, email, password);
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  return signOutSession(supabase);
}
