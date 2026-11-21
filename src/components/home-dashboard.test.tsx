import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { HomeDashboard } from "./home-dashboard";
import type { DashboardAccount, DashboardEntry } from "@/lib/dashboard/home";

const accounts: DashboardAccount[] = [
  { id: "nubank", name: "Conta principal", shortName: "Nubank", logoUrl: null },
  { id: "itau", name: "Salário", shortName: "Itaú", logoUrl: null },
  { id: "inter", name: "Reserva", shortName: "Inter", logoUrl: null },
];

const entries: DashboardEntry[] = [
  {
    id: "late",
    debitAccountId: "itau",
    creditAccountId: "nubank",
    amount: 1200,
    occurredAt: "2026-06-05T13:00:00.000Z",
    timeZone: "America/Sao_Paulo",
  },
  {
    id: "middle",
    debitAccountId: "nubank",
    creditAccountId: "inter",
    amount: 250,
    occurredAt: "2026-06-04T21:12:00.000Z",
    timeZone: "America/Sao_Paulo",
  },
  {
    id: "early",
    debitAccountId: "inter",
    creditAccountId: "nubank",
    amount: 80,
    occurredAt: "2026-06-02T12:40:00.000Z",
    timeZone: "America/Sao_Paulo",
  },
];

describe("HomeDashboard", () => {
  test("shows the current month net and the running account balances", async () => {
    const user = userEvent.setup();
    render(
      <HomeDashboard
        username="Leonardo"
        accounts={accounts}
        entries={entries}
        now="2026-06-15T15:00:00.000Z"
      />,
    );

    expect(screen.getByRole("heading", { name: "Olá, Leonardo" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Neste mês" })).toBeInTheDocument();
    expect(screen.getAllByText("Nubank").length).toBeGreaterThan(1);
    expect(screen.queryByRole("button", { name: "Ano" })).not.toBeInTheDocument();
    expect(screen.getByText("+1.200")).toBeInTheDocument();
    expect(screen.getByText("-250")).toBeInTheDocument();
    expect(screen.getByText("+80")).toBeInTheDocument();
    expect(screen.queryByText("R$ 0,00")).not.toBeInTheDocument();
    expect(screen.getByText("R$ +1.030,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 1.030,00")).toBeInTheDocument();
    expect(screen.getByText("-R$ 1.200,00")).toBeInTheDocument();
    expect(screen.getByText("Itaú → Nubank")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Adicionar" })).toHaveAttribute("href", "/contas");

    await user.click(screen.getAllByRole("button", { name: "Dia" })[0]);

    expect(screen.getByRole("heading", { name: "Hoje" })).toBeInTheDocument();
    expect(screen.getByText("Nenhum lançamento neste período.")).toBeInTheDocument();
  });
});
