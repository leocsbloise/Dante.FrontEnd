export const SESSION_COOKIE = "dante_session";

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  if (isAuthScreen(value)) {
    return "/";
  }

  return value;
}

function isAuthScreen(value: string) {
  return (
    value === "/entrar" ||
    value.startsWith("/entrar?") ||
    value.startsWith("/entrar/") ||
    value === "/criar-conta" ||
    value.startsWith("/criar-conta?") ||
    value.startsWith("/criar-conta/")
  );
}

export function usernameFromToken(token: string) {
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { unique_name?: unknown };
    return typeof claims.unique_name === "string" ? claims.unique_name : null;
  } catch {
    return null;
  }
}
