import { describe, expect, test } from "vitest";
import {
  balances,
  chartBuckets,
  formatPeriod,
  formatSigned,
  movements,
  periodNet,
  type DashboardAccount,
  type DashboardEntry,
} from "./home";

const accounts: DashboardAccount[] = [
  { id: "nubank", name: "Conta principal", shortName: "Nubank", logoUrl: null },
  { id: "itau", name: "Salário", shortName: "Itaú", logoUrl: null },
  { id: "inter", name: "Reserva", shortName: "Inter", logoUrl: null },
];

function entry(
  id: string,
  debitAccountId: string,
  creditAccountId: string,
  amount: number,
  occurredAt: string,
): DashboardEntry {
  return {
    id,
    debitAccountId,
    creditAccountId,
    amount,
    occurredAt,
    timeZone: "America/Sao_Paulo",
  };
}

const entries = [
  entry("late", "itau", "nubank", 1200, "2026-06-05T13:00:00.000Z"),
  entry("middle", "nubank", "inter", 250, "2026-06-04T21:12:00.000Z"),
  entry("early", "inter", "nubank", 80, "2026-06-02T12:40:00.000Z"),
  entry("may", "itau", "nubank", 10, "2026-06-01T02:00:00.000Z"),
];

const now = new Date("2026-06-15T15:00:00.000Z");

describe("home ledger", () => {
  test("keeps a running net per account and the nets sum to zero", () => {
    const totals = balances(accounts, entries);

    expect(totals.get("nubank")).toBe(120_000 - 25_000 + 8_000 + 1_000);
    expect(totals.get("itau")).toBe(-120_000 - 1_000);
    expect(totals.get("inter")).toBe(25_000 - 8_000);
    expect([...totals.values()].reduce((sum, value) => sum + value, 0)).toBe(0);
  });

  test("uses the current month in America/Sao_Paulo", () => {
    expect(periodNet(entries, "nubank", "month", now)).toBe(120_000 - 25_000 + 8_000);
    expect(formatPeriod(103_000)).toBe("R$ +1.030,00");
  });

  test("a day before the month in São Paulo stays out of the month", () => {
    expect(periodNet(entries, "nubank", "day", now)).toBe(0);
    expect(chartBuckets(entries, "nubank", "month", now)[4]).toBe(120_000);
    expect(chartBuckets(entries, "nubank", "month", now)[0]).toBe(0);
  });

  test("names both banks and signs the amount for the account in focus", () => {
    expect(movements(accounts, entries, "nubank", "month", now)).toEqual([
      expect.objectContaining({
        title: "Itaú → Nubank",
        cents: 120_000,
        when: "05 jun 2026, 10:00",
      }),
      expect.objectContaining({ title: "Nubank → Inter", cents: -25_000 }),
      expect.objectContaining({ title: "Inter → Nubank", cents: 8_000 }),
    ]);
    expect(formatSigned(120_000)).toBe("+R$\u00a01.200,00");
    expect(formatSigned(-25_000)).toBe("-R$\u00a0250,00");
  });
});
