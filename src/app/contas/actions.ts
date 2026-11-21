"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createOwnedAccount, type CreateAccountFailure } from "@/lib/api/accounts";
import { SESSION_COOKIE } from "@/lib/auth/session";

const signedOut = "Não foi possível criar a conta. Tente de novo.";

export async function createAccountAction(
  bankId: string,
  name: string,
): Promise<{ ok: true } | CreateAccountFailure> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return { ok: false, kind: "banner", message: signedOut };
  }

  const created = await createOwnedAccount(token, bankId, name);
  if (created.ok) {
    revalidatePath("/contas");
  }
  return created;
}
