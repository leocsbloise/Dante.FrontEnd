import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { LedgerScreen } from "./ledger-screen";
import { initialFilters, sampleAccounts, sampleMovements } from "@/lib/ledger/screen";

const createLedgerAction = vi.hoisted(() => vi.fn());
const replace = vi.hoisted(() => vi.fn());

vi.mock("@/app/lancamentos/actions", () => ({
  createLedgerAction,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: vi.fn() }),
}));

describe("LedgerScreen", () => {
  beforeEach(() => {
    createLedgerAction.mockReset();
    replace.mockReset();
  });

  test("shows the loaded movements and keeps a filter change in the address", async () => {
    const user = userEvent.setup();
    render(
      <LedgerScreen
        username="Leonardo"
        accounts={sampleAccounts}
        entries={sampleMovements}
        filters={initialFilters}
      />,
    );

    expect(screen.getByRole("heading", { name: "Lançamentos" })).toBeInTheDocument();
    expect(screen.getByText("Conta Nubank → Conta Itaú")).toBeInTheDocument();
    expect(screen.getByText("Conta Nubank → Conta Inter")).toBeInTheDocument();
    expect(screen.getByText((value) => value.replace(/\s/g, "") === "-R$390,00")).toBeInTheDocument();
    expect(screen.getByText("São Paulo · o fim não entra")).toBeInTheDocument();

    await user.selectOptions(screen.getByRole("combobox", { name: "Crédito" }), "itau");

    expect(replace).toHaveBeenCalledWith(
      "/lancamentos?debit=nubank&credit=itau&from=2026-05-01&to=2026-07-01",
    );
    expect(screen.getByText("Conta Nubank → Conta Itaú")).toBeInTheDocument();
    expect(screen.getByText("Conta Nubank → Conta Inter")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("De"), { target: { value: "2026-06-01" } });

    expect(replace).toHaveBeenCalledWith(
      "/lancamentos?debit=nubank&credit=itau&from=2026-06-01&to=2026-07-01",
    );
  });

  test("opens the form and does not record an incomplete transfer", async () => {
    const user = userEvent.setup();
    render(
      <LedgerScreen
        username="Leonardo"
        accounts={sampleAccounts}
        entries={sampleMovements}
        filters={initialFilters}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Lançar" }));
    await user.click(screen.getByRole("button", { name: "Lançar" }));

    expect(screen.getByText("Escolha a conta de débito.")).toBeInTheDocument();
    expect(screen.getByText("Escolha a conta de crédito.")).toBeInTheDocument();
    expect(screen.getByText("O valor precisa ser maior que zero.")).toBeInTheDocument();
    expect(screen.getByText("Informe quando aconteceu.")).toBeInTheDocument();
    expect(createLedgerAction).not.toHaveBeenCalled();
  });
});
