import { describe, expect, test } from "vitest";
import {
  ANY_ACCOUNT,
  defaultLedgerFilters,
  filtersFromSearch,
  initialFilters,
  ledgerHref,
  ledgerQuery,
  matchingMovements,
  movementCents,
  occurredAtWithOffset,
  parseAmount,
  sampleMovements,
} from "./screen";

describe("ledger screen", () => {
  test("keeps movements inside the window and signs them for the debit account", () => {
    const rows = matchingMovements(sampleMovements, initialFilters);

    expect(rows.map((row) => row.id)).toEqual(["may", "june"]);
    expect(movementCents(rows[0], initialFilters)).toBe(-39_000);
    expect(movementCents(rows[1], initialFilters)).toBe(-25_000);
  });

  test("drops the day the window ends", () => {
    const rows = matchingMovements(sampleMovements, { ...initialFilters, to: "2026-06-04" });

    expect(rows.map((row) => row.id)).toEqual(["may"]);
  });

  test("defaults to the current São Paulo month and omits either account", () => {
    const filters = defaultLedgerFilters(new Date("2026-03-15T15:00:00Z"));

    expect(filters).toEqual({
      debitAccountId: ANY_ACCOUNT,
      creditAccountId: ANY_ACCOUNT,
      from: "2026-03-01",
      to: "2026-04-01",
    });
    expect(ledgerQuery(filters).toString()).toBe(
      "timeZone=America%2FSao_Paulo&limit=100&from=2026-03-01&to=2026-04-01",
    );
    expect(filtersFromSearch({ debit: "nubank" }, new Date("2026-03-15T15:00:00Z"))).toEqual({
      ...filters,
      debitAccountId: "nubank",
    });
    expect(ledgerHref({ ...filters, debitAccountId: "nubank" })).toBe(
      "/lancamentos?debit=nubank&from=2026-03-01&to=2026-04-01",
    );
  });

  test("reads a Brazilian amount and a São Paulo local time", () => {
    expect(parseAmount("1.030,50")).toBe(1030.5);
    expect(parseAmount("0")).toBeNull();
    expect(occurredAtWithOffset("2026-03-15T22:30")).toBe("2026-03-15T22:30:00-03:00");
  });

  test("narrows to one credit account", () => {
    const filters = { ...initialFilters, creditAccountId: "itau" };
    const rows = matchingMovements(sampleMovements, filters);

    expect(rows.map((row) => row.id)).toEqual(["may"]);
  });
});
