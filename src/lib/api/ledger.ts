import {
  ledgerQuery,
  type LedgerAccount,
  type LedgerFilters,
  type LedgerMovement,
} from "@/lib/ledger/screen";

const PAGE_CAP = 20;
const fallback = "Não foi possível carregar os lançamentos.";

const messageCopy: Record<string, string> = {
  "A debit account, a credit account, or a time window is required.": "Escolha uma conta ou um período.",
  "The time window ends before it starts.": "O fim precisa ser depois do início.",
  "Account was not found.": "Conta não encontrada.",
};

export type LedgerLoad =
  | { ok: true; accounts: LedgerAccount[]; entries: LedgerMovement[] }
  | { ok: false; accounts: LedgerAccount[] | null; message: string };

function apiUrl(path: string) {
  const base = process.env.DANTE_API_URL ?? "http://localhost:8080";
  return new URL(path, base);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function failureMessage(body: unknown) {
  if (!isRecord(body)) {
    return fallback;
  }
  if (typeof body.message === "string" && messageCopy[body.message]) {
    return messageCopy[body.message];
  }
  if (isRecord(body.data) && (typeof body.data.from === "string" || typeof body.data.to === "string")) {
    return "O período não pôde ser lido.";
  }
  return fallback;
}

async function readJson(path: string, token: string) {
  const response = await fetch(apiUrl(path), {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body: unknown = await response.json().catch(() => null);
  return { ok: response.ok, body };
}

function readAccount(value: unknown): LedgerAccount | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  if (!isRecord(value.bank) || typeof value.bank.shortName !== "string") {
    return null;
  }
  return { id: value.id, name: value.name, shortName: value.bank.shortName };
}

function readEntry(value: unknown): LedgerMovement | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    typeof value.id !== "string" ||
    typeof value.debitAccountId !== "string" ||
    typeof value.creditAccountId !== "string" ||
    typeof value.amount !== "number" ||
    typeof value.occurredAt !== "string" ||
    typeof value.timeZone !== "string"
  ) {
    return null;
  }
  return {
    id: value.id,
    debitAccountId: value.debitAccountId,
    creditAccountId: value.creditAccountId,
    amount: value.amount,
    occurredAt: value.occurredAt,
    timeZone: value.timeZone,
  };
}

async function searchEntries(token: string, filters: LedgerFilters): Promise<
  { ok: true; entries: LedgerMovement[] } | { ok: false; message: string }
> {
  const entries: LedgerMovement[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < PAGE_CAP; page += 1) {
    let response: { ok: boolean; body: unknown };
    try {
      response = await readJson(`/api/ledger?${ledgerQuery(filters, cursor).toString()}`, token);
    } catch {
      return { ok: false, message: fallback };
    }
    if (!response.ok) {
      return { ok: false, message: failureMessage(response.body) };
    }
    const data = isRecord(response.body) ? response.body.data : null;
    if (!isRecord(data) || !Array.isArray(data.entries)) {
      return { ok: false, message: fallback };
    }
    for (const item of data.entries) {
      const entry = readEntry(item);
      if (entry) {
        entries.push(entry);
      }
    }
    cursor = typeof data.nextCursor === "string" && data.nextCursor.length > 0 ? data.nextCursor : undefined;
    if (!cursor) {
      break;
    }
  }
  return { ok: true, entries };
}

export async function loadLedger(token: string, filters: LedgerFilters): Promise<LedgerLoad> {
  let accountsBody: unknown;
  try {
    const response = await readJson("/api/accounts", token);
    if (!response.ok) {
      return { ok: false, accounts: null, message: fallback };
    }
    accountsBody = isRecord(response.body) ? response.body.data : null;
  } catch {
    return { ok: false, accounts: null, message: fallback };
  }
  if (!Array.isArray(accountsBody)) {
    return { ok: false, accounts: null, message: fallback };
  }

  const accounts = accountsBody.flatMap((item) => {
    const account = readAccount(item);
    return account ? [account] : [];
  });
  const entries = await searchEntries(token, filters);
  if (!entries.ok) {
    return { ok: false, accounts, message: entries.message };
  }
  return { ok: true, accounts, entries: entries.entries };
}

export async function searchLedger(token: string, filters: LedgerFilters) {
  return searchEntries(token, filters);
}

export type LedgerDraft = {
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  occurredAt: string;
  timeZone: string;
};

export type CreateLedgerFailure =
  | { ok: false; kind: "banner"; message: string }
  | {
      ok: false;
      kind: "fields";
      fields: { debitAccountId?: string; creditAccountId?: string; amount?: string; occurredAt?: string };
    };

const createFallback = "Não foi possível lançar. Tente de novo.";

const fieldCopy: Record<string, string> = {
  "A debit account is required.": "Escolha a conta de débito.",
  "A credit account is required.": "Escolha a conta de crédito.",
  "The debit and credit accounts must be different.": "Débito e crédito precisam ser contas diferentes.",
  "Amount must be greater than zero.": "O valor precisa ser maior que zero.",
  "Amount must have at most two decimal places.": "O valor pode ter no máximo duas casas.",
  "A time is required.": "Informe quando aconteceu.",
  "Time zone was not recognized.": "Fuso não reconhecido.",
  "Account was not found.": "Conta não encontrada.",
};

const fieldKeys = ["debitAccountId", "creditAccountId", "amount", "occurredAt"] as const;

export async function createLedgerEntry(
  token: string,
  draft: LedgerDraft,
): Promise<{ ok: true } | CreateLedgerFailure> {
  try {
    const response = await fetch(apiUrl("/api/ledger"), {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(draft),
      cache: "no-store",
    });
    if (response.ok) {
      return { ok: true };
    }

    const body: unknown = await response.json().catch(() => null);
    if (isRecord(body) && typeof body.message === "string" && fieldCopy[body.message]) {
      return { ok: false, kind: "banner", message: fieldCopy[body.message] };
    }
    if (isRecord(body) && isRecord(body.data)) {
      const fields: {
        debitAccountId?: string;
        creditAccountId?: string;
        amount?: string;
        occurredAt?: string;
      } = {};
      for (const key of fieldKeys) {
        const message = body.data[key];
        if (typeof message === "string" && message.length > 0) {
          fields[key] = fieldCopy[message] ?? message;
        }
      }
      if (typeof body.data.timeZone === "string" && body.data.timeZone.length > 0) {
        fields.occurredAt = fieldCopy[body.data.timeZone] ?? body.data.timeZone;
      }
      if (fields.debitAccountId || fields.creditAccountId || fields.amount || fields.occurredAt) {
        return { ok: false, kind: "fields", fields };
      }
    }
    return { ok: false, kind: "banner", message: createFallback };
  } catch {
    return { ok: false, kind: "banner", message: createFallback };
  }
}
