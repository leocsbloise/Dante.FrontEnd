export type LedgerAccount = {
  id: string;
  name: string;
  shortName: string;
};

export type LedgerMovement = {
  id: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  occurredAt: string;
  timeZone: string;
};

export type LedgerFilters = {
  debitAccountId: string;
  creditAccountId: string;
  from: string;
  to: string;
};

export const ANY_ACCOUNT = "any";
export const LEDGER_ZONE = "America/Sao_Paulo";

export const sampleAccounts: LedgerAccount[] = [
  { id: "nubank", name: "Conta Nubank", shortName: "Nubank" },
  { id: "itau", name: "Conta Itaú", shortName: "Itaú" },
  { id: "inter", name: "Conta Inter", shortName: "Inter" },
];

export const sampleMovements: LedgerMovement[] = [
  {
    id: "may",
    debitAccountId: "nubank",
    creditAccountId: "itau",
    amount: 390,
    occurredAt: "2026-05-28T14:05:00.000Z",
    timeZone: "America/Sao_Paulo",
  },
  {
    id: "june",
    debitAccountId: "nubank",
    creditAccountId: "inter",
    amount: 250,
    occurredAt: "2026-06-04T21:12:00.000Z",
    timeZone: "America/Sao_Paulo",
  },
];

export const initialFilters: LedgerFilters = {
  debitAccountId: "nubank",
  creditAccountId: ANY_ACCOUNT,
  from: "2026-05-01",
  to: "2026-07-01",
};

export function defaultLedgerFilters(now: Date): LedgerFilters {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: LEDGER_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((item) => item.type === "year")?.value);
  const month = Number(parts.find((item) => item.type === "month")?.value);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    debitAccountId: ANY_ACCOUNT,
    creditAccountId: ANY_ACCOUNT,
    from: `${year}-${pad(month)}-01`,
    to: `${nextYear}-${pad(nextMonth)}-01`,
  };
}

export function filtersFromSearch(
  search: { debit?: string; credit?: string; from?: string; to?: string },
  now: Date,
): LedgerFilters {
  if (
    search.debit === undefined &&
    search.credit === undefined &&
    search.from === undefined &&
    search.to === undefined
  ) {
    return defaultLedgerFilters(now);
  }

  const defaults = defaultLedgerFilters(now);
  return {
    debitAccountId: search.debit || ANY_ACCOUNT,
    creditAccountId: search.credit || ANY_ACCOUNT,
    from: search.from ?? defaults.from,
    to: search.to ?? defaults.to,
  };
}

export function ledgerHref(filters: LedgerFilters) {
  const params = new URLSearchParams();
  if (filters.debitAccountId !== ANY_ACCOUNT) {
    params.set("debit", filters.debitAccountId);
  }
  if (filters.creditAccountId !== ANY_ACCOUNT) {
    params.set("credit", filters.creditAccountId);
  }
  params.set("from", filters.from);
  params.set("to", filters.to);
  return `/lancamentos?${params.toString()}`;
}

export function ledgerQuery(filters: LedgerFilters, cursor?: string) {
  const params = new URLSearchParams({ timeZone: LEDGER_ZONE, limit: "100" });
  if (filters.debitAccountId !== ANY_ACCOUNT) {
    params.set("debitAccountId", filters.debitAccountId);
  }
  if (filters.creditAccountId !== ANY_ACCOUNT) {
    params.set("creditAccountId", filters.creditAccountId);
  }
  if (filters.from) {
    params.set("from", filters.from);
  }
  if (filters.to) {
    params.set("to", filters.to);
  }
  if (cursor) {
    params.set("cursor", cursor);
  }
  return params;
}

function civilDate(occurredAt: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(occurredAt));
}

export function matchingMovements(movements: LedgerMovement[], filters: LedgerFilters) {
  return movements
    .filter((movement) => {
      if (filters.debitAccountId !== ANY_ACCOUNT && movement.debitAccountId !== filters.debitAccountId) {
        return false;
      }
      if (filters.creditAccountId !== ANY_ACCOUNT && movement.creditAccountId !== filters.creditAccountId) {
        return false;
      }
      const day = civilDate(movement.occurredAt, movement.timeZone);
      if (filters.from && day < filters.from) {
        return false;
      }
      return !filters.to || day < filters.to;
    })
    .slice()
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
}

export function movementCents(movement: LedgerMovement, filters: LedgerFilters) {
  const cents = Math.round(movement.amount * 100);
  if (filters.debitAccountId !== ANY_ACCOUNT) {
    return -cents;
  }
  if (filters.creditAccountId !== ANY_ACCOUNT) {
    return cents;
  }
  return null;
}

export function parseAmount(value: string) {
  const trimmed = value.trim().replace(/\s/g, "");
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.includes(",") ? trimmed.replace(/\./g, "").replace(",", ".") : trimmed;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  const amount = Number(normalized);
  return amount > 0 ? amount : null;
}

function zoneOffsetMinutes(instant: Date, timeZone: string) {
  const name =
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
      .formatToParts(instant)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = name.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) {
    return 0;
  }
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "+" ? minutes : -minutes;
}

export function occurredAtWithOffset(local: string, timeZone = LEDGER_ZONE) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) {
    return null;
  }
  const guessed = new Date(`${local}:00Z`);
  if (Number.isNaN(guessed.getTime())) {
    return null;
  }
  const first = zoneOffsetMinutes(guessed, timeZone);
  const settled = zoneOffsetMinutes(new Date(guessed.getTime() - first * 60_000), timeZone);
  const sign = settled >= 0 ? "+" : "-";
  const absolute = Math.abs(settled);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const minutes = String(absolute % 60).padStart(2, "0");
  return `${local}:00${sign}${hours}:${minutes}`;
}

export function formatFilterDay(isoDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return "Escolha";
  }
  const [year, month, day] = isoDate.split("-").map(Number);
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date(Date.UTC(year, month - 1, day, 12)));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("day")} ${part("month").replace(".", "")} ${part("year")}`;
}
