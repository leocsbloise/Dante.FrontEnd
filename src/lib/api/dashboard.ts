import type { DashboardAccount, DashboardEntry } from "@/lib/dashboard/home";

const HISTORY_FROM = "1970-01-01";
const HISTORY_TO = "2100-01-01";
const VIEW_ZONE = "America/Sao_Paulo";
const PAGE_CAP = 20;

export type HomeData = {
  accounts: DashboardAccount[];
  entries: DashboardEntry[];
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

function readAccount(value: unknown): DashboardAccount | null {
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

function readEntry(value: unknown): DashboardEntry | null {
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

export async function loadHome(token: string): Promise<HomeData | null> {
  const accountsBody = await readData("/api/accounts", token);
  if (!Array.isArray(accountsBody)) {
    return null;
  }

  const accounts = accountsBody.flatMap((item) => {
    const account = readAccount(item);
    return account ? [account] : [];
  });

  const entries: DashboardEntry[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < PAGE_CAP; page += 1) {
    const params = new URLSearchParams({
      from: HISTORY_FROM,
      to: HISTORY_TO,
      timeZone: VIEW_ZONE,
      limit: "100",
    });
    if (cursor) {
      params.set("cursor", cursor);
    }
    const data = await readData(`/api/ledger?${params.toString()}`, token);
    if (!isRecord(data) || !Array.isArray(data.entries)) {
      return null;
    }
    for (const item of data.entries) {
      const entry = readEntry(item);
      if (entry) {
        entries.push(entry);
      }
    }
    cursor = typeof data.nextCursor === "string" && data.nextCursor.length > 0 ? data.nextCursor : null;
    if (!cursor) {
      break;
    }
  }

  return { accounts, entries };
}
