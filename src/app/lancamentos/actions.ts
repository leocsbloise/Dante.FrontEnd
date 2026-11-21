"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createLedgerEntry, searchLedger, type CreateLedgerFailure } from "@/lib/api/ledger";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { LEDGER_ZONE, occurredAtWithOffset, parseAmount, type LedgerFilters, type LedgerMovement } from "@/lib/ledger/screen";

const signedOut = "Não foi possível carregar os lançamentos.";
const createSignedOut = "Não foi possível lançar. Tente de novo.";

export async function searchLedgerAction(
  filters: LedgerFilters,
): Promise<{ ok: true; entries: LedgerMovement[] } | { ok: false; message: string }> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return { ok: false, message: signedOut };
  }

  return searchLedger(token, filters);
}

export async function createLedgerAction(input: {
  debitAccountId: string;
  creditAccountId: string;
  amount: string;
  occurredAt: string;
}): Promise<{ ok: true } | CreateLedgerFailure> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return { ok: false, kind: "banner", message: createSignedOut };
  }

  const amount = parseAmount(input.amount);
  const occurredAt = occurredAtWithOffset(input.occurredAt);
  const fields: {
    debitAccountId?: string;
    creditAccountId?: string;
    amount?: string;
    occurredAt?: string;
  } = {};
  if (!input.debitAccountId) {
    fields.debitAccountId = "Escolha a conta de débito.";
  }
  if (!input.creditAccountId) {
    fields.creditAccountId = "Escolha a conta de crédito.";
  }
  if (input.debitAccountId && input.debitAccountId === input.creditAccountId) {
    fields.debitAccountId = "Débito e crédito precisam ser contas diferentes.";
    fields.creditAccountId = "Débito e crédito precisam ser contas diferentes.";
  }
  if (amount === null) {
    fields.amount = "O valor precisa ser maior que zero.";
  }
  if (!occurredAt) {
    fields.occurredAt = "Informe quando aconteceu.";
  }
  if (fields.debitAccountId || fields.creditAccountId || fields.amount || fields.occurredAt || amount === null || !occurredAt) {
    return { ok: false, kind: "fields", fields };
  }

  const created = await createLedgerEntry(token, {
    debitAccountId: input.debitAccountId,
    creditAccountId: input.creditAccountId,
    amount,
    occurredAt,
    timeZone: LEDGER_ZONE,
  });
  if (created.ok) {
    revalidatePath("/lancamentos");
    revalidatePath("/");
  }
  return created;
}
