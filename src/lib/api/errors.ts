const banners: Record<string, string> = {
  "Invalid username or password.": "Usuário ou senha inválidos.",
};

const fields: Record<string, string> = {
  "This value is not valid.": "Este valor não é válido.",
  "Username must be 3 to 32 characters and use letters, digits, dots, underscores, or hyphens.":
    "O usuário precisa ter de 3 a 32 caracteres: letras, números, ponto, _ ou -.",
  "Password must be 8 to 128 characters.": "A senha precisa ter de 8 a 128 caracteres.",
  "Username is already in use.": "Este usuário já está em uso.",
};

export type AuthFailure =
  | { kind: "banner"; message: string }
  | { kind: "fields"; fields: Partial<Record<"username" | "password", string>> };

const fallback = "Não foi possível entrar. Tente de novo.";

export const registerFallback = "Não foi possível criar a conta. Tente de novo.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function translate(message: string, table: Record<string, string>) {
  return table[message] ?? message;
}

export function readAuthFailure(body: unknown, whenUnknown = fallback): AuthFailure {
  if (isRecord(body) && typeof body.error === "string" && body.error.length > 0) {
    return { kind: "banner", message: translate(body.error, banners) };
  }

  if (isRecord(body) && isRecord(body.data)) {
    const mapped: Partial<Record<"username" | "password", string>> = {};
    for (const key of ["username", "password"] as const) {
      const message = body.data[key];
      if (typeof message === "string" && message.length > 0) {
        mapped[key] = translate(message, fields);
      }
    }

    if (mapped.username || mapped.password) {
      return { kind: "fields", fields: mapped };
    }
  }

  return { kind: "banner", message: whenUnknown };
}

export function readAccessToken(body: unknown) {
  if (!isRecord(body) || !isRecord(body.data)) {
    return null;
  }

  const token = body.data.accessToken;
  const expiresAt = body.data.expiresAt;
  if (typeof token !== "string" || token.length === 0) {
    return null;
  }

  const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : null;
  return {
    token,
    expiresAt: expiry && !Number.isNaN(expiry.getTime()) ? expiry : null,
  };
}
