import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignInPage from "./page";

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  next: null as string | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navigation.push,
    refresh: navigation.refresh,
  }),
  useSearchParams: () =>
    new URLSearchParams(navigation.next ? [["next", navigation.next]] : []),
}));

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

beforeEach(() => {
  navigation.push.mockReset();
  navigation.refresh.mockReset();
  navigation.next = null;
});

describe("Entrar", () => {
  test("shows the sign-in screen and a link to create an account", () => {
    render(<SignInPage />);

    expect(screen.getByRole("heading", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByLabelText("Usuário")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Entrar" })).toHaveClass(
      "cursor-pointer",
    );
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/criar-conta",
    );
  });

  test("asks for empty fields and does not call the server", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Usuário"), "   ");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByText("Informe o usuário.")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("shows the server banner and stays on the screen", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json({ ok: false, banner: "Usuário ou senha inválidos." }, 401),
      ),
    );
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Usuário"), "leonardo");
    await user.type(screen.getByLabelText("Senha"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Usuário ou senha inválidos.",
    );
    expect(navigation.push).not.toHaveBeenCalled();
  });

  test("shows a field error returned by the server", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json(
          { ok: false, fields: { password: "A senha precisa ter de 8 a 128 caracteres." } },
          400,
        ),
      ),
    );
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Usuário"), "leonardo");
    await user.type(screen.getByLabelText("Senha"), "short");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("A senha precisa ter de 8 a 128 caracteres."),
    ).toBeInTheDocument();
  });

  test("shows a fallback when the response has no message", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })));
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Usuário"), "leonardo");
    await user.type(screen.getByLabelText("Senha"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível entrar. Tente de novo.",
    );
  });

  test("shows a fallback when the request fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Usuário"), "leonardo");
    await user.type(screen.getByLabelText("Senha"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível entrar. Tente de novo.",
    );
  });

  test("opens the requested page after signing in", async () => {
    const user = userEvent.setup();
    navigation.next = "/contas";
    const fetchMock = vi.fn().mockResolvedValue(json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Usuário"), "leonardo");
    await user.type(screen.getByLabelText("Senha"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/contas"));
    expect(navigation.refresh).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "leonardo", password: "correct-horse" }),
    });
  });

  test("ignores a next path that leaves the app", async () => {
    const user = userEvent.setup();
    navigation.next = "//evil.example";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ ok: true })));
    render(<SignInPage />);

    await user.type(screen.getByLabelText("Usuário"), "leonardo");
    await user.type(screen.getByLabelText("Senha"), "correct-horse");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/"));
  });
});
