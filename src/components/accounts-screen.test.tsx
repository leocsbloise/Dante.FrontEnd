import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AccountsScreen } from "./accounts-screen";
import type { AccountRow, BankOption } from "@/lib/api/accounts";

const createAccountAction = vi.hoisted(() => vi.fn());

vi.mock("@/app/contas/actions", () => ({
  createAccountAction,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const banks: BankOption[] = [
  { id: "nubank", shortName: "Nubank", logoUrl: "https://example.com/nubank.svg" },
];

const accounts: AccountRow[] = Array.from({ length: 11 }, (_, index) => ({
  id: `account-${index + 1}`,
  name: `Conta ${index + 1}`,
  shortName: "Nubank",
  logoUrl: "https://example.com/nubank.svg",
}));

describe("AccountsScreen", () => {
  beforeEach(() => {
    createAccountAction.mockReset();
  });

  test("pages ten accounts at a time", async () => {
    const user = userEvent.setup();
    render(<AccountsScreen username="Leonardo" accounts={accounts} banks={banks} />);

    expect(screen.getByText("Conta 1").closest("li")?.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/nubank.svg",
    );
    expect(screen.getByText("Conta 1")).toBeInTheDocument();
    expect(screen.getByText("Conta 10")).toBeInTheDocument();
    expect(screen.queryByText("Conta 11")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(screen.getByText("Conta 11")).toBeInTheDocument();
    expect(screen.queryByText("Conta 1")).not.toBeInTheDocument();
  });

  test("opens the form and does not submit a missing bank or name", async () => {
    const user = userEvent.setup();
    render(<AccountsScreen username="Leonardo" accounts={[]} banks={banks} />);

    expect(screen.getByText("Nenhuma conta ainda.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Criar" }));
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Adicionar conta" }));

    expect(screen.getByText("Escolha um banco.")).toBeInTheDocument();
    expect(screen.getByText("Informe o nome.")).toBeInTheDocument();
    expect(createAccountAction).not.toHaveBeenCalled();

    await user.click(screen.getByRole("combobox", { name: "Banco" }));
    await user.click(screen.getByRole("option", { name: "Nubank" }));
    await user.type(screen.getByRole("textbox", { name: "Nome" }), "Reserva");
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    await user.click(screen.getByRole("button", { name: "Criar" }));

    expect(screen.getByRole("combobox", { name: "Banco" })).toHaveTextContent("Escolha");
    expect(screen.getByRole("textbox", { name: "Nome" })).toHaveValue("");
    expect(screen.queryByText("Escolha um banco.")).not.toBeInTheDocument();
    expect(screen.queryByText("Informe o nome.")).not.toBeInTheDocument();
  });

  test("shows the bank logo in the list", async () => {
    const user = userEvent.setup();
    render(<AccountsScreen username="Leonardo" accounts={[]} banks={banks} />);

    await user.click(screen.getByRole("button", { name: "Criar" }));
    await user.click(screen.getByRole("combobox", { name: "Banco" }));

    expect(screen.getByRole("option", { name: "Nubank" }).querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/nubank.svg",
    );
  });
});
