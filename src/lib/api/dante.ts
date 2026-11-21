import {
  readAccessToken,
  readAuthFailure,
  registerFallback,
  type AuthFailure,
} from "@/lib/api/errors";

export type SignInResult =
  | { ok: true; token: string; expiresAt: Date }
  | ({ ok: false; status: number } & AuthFailure);

function apiUrl(path: string) {
  const base = process.env.DANTE_API_URL ?? "http://localhost:8080";
  return new URL(path, base);
}

async function postJson(path: string, body: unknown) {
  try {
    const response = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json: unknown = await response.json().catch(() => null);
    return { response, json };
  } catch {
    return null;
  }
}

export async function signIn(username: string, password: string): Promise<SignInResult> {
  const posted = await postJson("/api/auth/login", { username, password });
  if (!posted) {
    return { ok: false, status: 502, kind: "banner", message: "Não foi possível entrar. Tente de novo." };
  }

  const { response, json: body } = posted;
  if (!response.ok) {
    return { ok: false, status: response.status, ...readAuthFailure(body) };
  }

  const session = readAccessToken(body);
  if (!session) {
    return { ok: false, status: 502, kind: "banner", message: "Não foi possível entrar. Tente de novo." };
  }

  const expiresAt =
    session.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000);
  return { ok: true, token: session.token, expiresAt };
}

export async function register(username: string, password: string): Promise<SignInResult> {
  const posted = await postJson("/api/auth/register", { username, password });
  if (!posted) {
    return { ok: false, status: 502, kind: "banner", message: registerFallback };
  }

  if (!posted.response.ok) {
    return {
      ok: false,
      status: posted.response.status,
      ...readAuthFailure(posted.json, registerFallback),
    };
  }

  const session = await signIn(username, password);
  if (!session.ok) {
    return {
      ok: false,
      status: session.status,
      kind: "banner",
      message: "Conta criada. Entre com o usuário e a senha.",
    };
  }

  return session;
}
