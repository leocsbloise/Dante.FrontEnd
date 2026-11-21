import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterPage from "./page";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navigation.push,
    refresh: navigation.refresh,
  }),
}));

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
  navigation.push.mockReset();
  navigation.refresh.mockReset();
});

describe("Criar conta", () => {
  test("shows the register screen and a link back to sign in", () => {
    render(<RegisterPage />);

    expect(screen.getByRole("heading", { name: "Criar conta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Usuário")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Criar conta" })).toHaveClass(
      "cursor-pointer",
    );
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/entrar",
    );
  });

  test("asks for empty fields and does not call the server", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterPage />);

    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(screen.getByText("Informe o usuário.")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("shows a taken username under the field", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json({ ok: false, fields: { username: "Este usuário já está em uso." } }, 409),
      ),
    );
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Usuário"), "leonardo");
    await user.type(screen.getByLabelText("Senha"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Este usuário já está em uso.")).toBeInTheDocument();
    expect(navigation.push).not.toHaveBeenCalled();
  });

  test("shows the server banner and stays on the screen", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json(
          { ok: false, banner: "Conta criada. Entre com o usuário e a senha." },
          502,
        ),
      ),
    );
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Usuário"), "leonardo");
    await user.type(screen.getByLabelText("Senha"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Conta criada. Entre com o usuário e a senha.",
    );
    expect(navigation.push).not.toHaveBeenCalled();
  });

  test("shows a fallback when the request fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Usuário"), "leonardo");
    await user.type(screen.getByLabelText("Senha"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível criar a conta. Tente de novo.",
    );
  });

  test("opens home after the account is created", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    render(<RegisterPage />);

    await user.type(screen.getByLabelText("Usuário"), "leonardo");
    await user.type(screen.getByLabelText("Senha"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/"));
    expect(navigation.refresh).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "leonardo", password: "correct-horse" }),
    });
  });
});
