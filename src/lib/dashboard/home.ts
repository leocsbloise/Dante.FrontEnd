export const VIEW_ZONE = "America/Sao_Paulo";

export type Period = "day" | "week" | "month" | "year";

export type DashboardAccount = {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
};

export type DashboardEntry = {
  id: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  occurredAt: string;
  timeZone: string;
};

export type Movement = {
  id: string;
  title: string;
  when: string;
  cents: number;
};

const weekdays: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

type Civil = {
  year: number;
  month: number;
  day: number;
  hour: number;
  weekday: number;
};

function part(parts: Intl.DateTimeFormatPart[], type: string) {
  return parts.find((item) => item.type === type)?.value ?? "";
}

function civil(instant: Date, timeZone: string): Civil {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  }).formatToParts(instant);
  const hour = Number(part(parts, "hour"));
  return {
    year: Number(part(parts, "year")),
    month: Number(part(parts, "month")),
    day: Number(part(parts, "day")),
    hour: hour === 24 ? 0 : hour,
    weekday: weekdays[part(parts, "weekday")] ?? 0,
  };
}

function dayNumber(value: Civil) {
  return Math.floor(Date.UTC(value.year, value.month - 1, value.day) / 86_400_000);
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function toCents(amount: number) {
  return Math.round(amount * 100);
}

function signedCents(entry: DashboardEntry, accountId: string) {
  const cents = toCents(entry.amount);
  if (entry.creditAccountId === accountId) {
    return cents;
  }
  if (entry.debitAccountId === accountId) {
    return -cents;
  }
  return 0;
}

export function balances(accounts: DashboardAccount[], entries: DashboardEntry[]) {
  const totals = new Map(accounts.map((account) => [account.id, 0]));
  for (const entry of entries) {
    const cents = toCents(entry.amount);
    if (totals.has(entry.creditAccountId)) {
      totals.set(entry.creditAccountId, (totals.get(entry.creditAccountId) ?? 0) + cents);
    }
    if (totals.has(entry.debitAccountId)) {
      totals.set(entry.debitAccountId, (totals.get(entry.debitAccountId) ?? 0) - cents);
    }
  }
  return totals;
}

function inPeriod(when: Civil, current: Civil, period: Period) {
  if (period === "year") {
    return when.year === current.year;
  }
  if (period === "month") {
    return when.year === current.year && when.month === current.month;
  }
  if (period === "day") {
    return (
      when.year === current.year &&
      when.month === current.month &&
      when.day === current.day
    );
  }

  const start = dayNumber(current) - current.weekday;
  const day = dayNumber(when);
  return day >= start && day < start + 7;
}

function touching(entries: DashboardEntry[], accountId: string, period: Period, now: Date) {
  const current = civil(now, VIEW_ZONE);
  return entries.filter((entry) => {
    const instant = new Date(entry.occurredAt);
    if (Number.isNaN(instant.getTime()) || signedCents(entry, accountId) === 0) {
      return false;
    }
    return inPeriod(civil(instant, VIEW_ZONE), current, period);
  });
}

export function periodNet(
  entries: DashboardEntry[],
  accountId: string,
  period: Period,
  now: Date,
) {
  return touching(entries, accountId, period, now).reduce(
    (total, entry) => total + signedCents(entry, accountId),
    0,
  );
}

export function chartBuckets(
  entries: DashboardEntry[],
  accountId: string,
  period: Period,
  now: Date,
) {
  const current = civil(now, VIEW_ZONE);
  const length =
    period === "day" ? 24 : period === "week" ? 7 : period === "month" ? daysInMonth(current.year, current.month) : 12;
  const buckets = Array.from({ length }, () => 0);
  for (const entry of touching(entries, accountId, period, now)) {
    const when = civil(new Date(entry.occurredAt), VIEW_ZONE);
    const index =
      period === "day"
        ? when.hour
        : period === "week"
          ? when.weekday
          : period === "month"
            ? when.day - 1
            : when.month - 1;
    buckets[index] += signedCents(entry, accountId);
  }
  return buckets;
}

export function movements(
  accounts: DashboardAccount[],
  entries: DashboardEntry[],
  accountId: string,
  period: Period,
  now: Date,
): Movement[] {
  const names = new Map(accounts.map((account) => [account.id, account.shortName]));
  return touching(entries, accountId, period, now)
    .slice()
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 5)
    .map((entry) => ({
      id: entry.id,
      title: `${names.get(entry.debitAccountId) ?? "Conta"} → ${names.get(entry.creditAccountId) ?? "Conta"}`,
      when: formatWhen(entry.occurredAt, entry.timeZone),
      cents: signedCents(entry, accountId),
    }));
}

export function formatWhen(occurredAt: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(occurredAt));
  const month = part(parts, "month").replace(".", "");
  return `${part(parts, "day")} ${month} ${part(parts, "year")}, ${part(parts, "hour")}:${part(parts, "minute")}`;
}

export function formatBalance(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatSigned(cents: number) {
  const amount = formatBalance(Math.abs(cents));
  if (cents > 0) {
    return `+${amount}`;
  }
  if (cents < 0) {
    return `-${amount}`;
  }
  return amount;
}

export function formatPeriod(cents: number) {
  const number = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(cents) / 100);
  if (cents > 0) {
    return `R$ +${number}`;
  }
  if (cents < 0) {
    return `R$ -${number}`;
  }
  return `R$ ${number}`;
}

export const periodCopy: Record<Period, string> = {
  day: "Hoje",
  week: "Nesta semana",
  month: "Neste mês",
  year: "Neste ano",
};
