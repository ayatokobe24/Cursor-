"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/lib/transactions/actions";
import {
  insert,
  remove,
  update,
} from "@/lib/transactions/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function homeDeps() {
  const supabase = await createServerSupabaseClient();
  return {
    requireUser,
    insert: (userId: string, draft: Parameters<typeof insert>[2]) =>
      insert(supabase, userId, draft),
    update: (
      userId: string,
      id: string,
      draft: Parameters<typeof update>[3],
    ) => update(supabase, userId, id, draft),
    remove: (userId: string, id: string) => remove(supabase, userId, id),
    revalidateHome: () => {
      revalidatePath("/");
    },
  };
}

export async function create(input: unknown) {
  return createTransaction(input, await homeDeps());
}

export async function updateRecord(id: string, input: unknown) {
  return updateTransaction(id, input, await homeDeps());
}

export async function removeRecord(id: string, confirmed: boolean) {
  return deleteTransaction(id, confirmed, await homeDeps());
}
