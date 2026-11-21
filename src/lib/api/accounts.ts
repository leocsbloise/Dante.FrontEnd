export type AccountRow = {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
};

export type BankOption = {
  id: string;
  shortName: string;
  logoUrl: string | null;
};

export type AccountsHome = {
  accounts: AccountRow[];
  banks: BankOption[];
};

export type CreateAccountFailure =
  | { ok: false; kind: "banner"; message: string }
  | { ok: false; kind: "fields"; fields: { bankId?: string; name?: string } };

const createFallback = "Não foi possível criar a conta. Tente de novo.";

const fieldCopy: Record<string, string> = {
  "A bank is required.": "Escolha um banco.",
  "Bank was not found.": "Banco não encontrado.",
  "Account name must be 1 to 80 characters.": "O nome precisa ter de 1 a 80 caracteres.",
};

function apiUrl(path: string) {
  const base = process.env.DANTE_API_URL ?? "http://localhost:8080";
  return new URL(path, base);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readData(path: string, token: string) {
  try {
    const response = await fetch(apiUrl(path), {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const body: unknown = await response.json();
    return isRecord(body) ? body.data : null;
  } catch {
    return null;
  }
}

function readAccount(value: unknown): AccountRow | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  if (!isRecord(value.bank) || typeof value.bank.shortName !== "string") {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    shortName: value.bank.shortName,
    logoUrl: typeof value.bank.logoUrl === "string" ? value.bank.logoUrl : null,
  };
}

function readBank(value: unknown): BankOption | null {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.shortName !== "string") {
    return null;
  }
  return {
    id: value.id,
    shortName: value.shortName,
    logoUrl: typeof value.logoUrl === "string" ? value.logoUrl : null,
  };
}

export async function loadAccountsHome(token: string): Promise<AccountsHome | null> {
  const [accountsBody, banksBody] = await Promise.all([
    readData("/api/accounts", token),
    readData("/api/banks", token),
  ]);
  if (!Array.isArray(accountsBody) || !Array.isArray(banksBody)) {
    return null;
  }

  return {
    accounts: accountsBody.flatMap((item) => {
      const account = readAccount(item);
      return account ? [account] : [];
    }),
    banks: banksBody.flatMap((item) => {
      const bank = readBank(item);
      return bank ? [bank] : [];
    }),
  };
}

export async function createOwnedAccount(
  token: string,
  bankId: string,
  name: string,
): Promise<{ ok: true } | CreateAccountFailure> {
  try {
    const response = await fetch(apiUrl("/api/accounts"), {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ bankId, name }),
      cache: "no-store",
    });
    if (response.ok) {
      return { ok: true };
    }

    const body: unknown = await response.json().catch(() => null);
    if (isRecord(body) && isRecord(body.data)) {
      const fields: { bankId?: string; name?: string } = {};
      for (const key of ["bankId", "name"] as const) {
        const message = body.data[key];
        if (typeof message === "string" && message.length > 0) {
          fields[key] = fieldCopy[message] ?? message;
        }
      }
      if (fields.bankId || fields.name) {
        return { ok: false, kind: "fields", fields };
      }
    }

    return { ok: false, kind: "banner", message: createFallback };
  } catch {
    return { ok: false, kind: "banner", message: createFallback };
  }
}
