import { cookies } from "next/headers";
import { signIn } from "@/lib/api/dante";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: unknown;
    password?: unknown;
  } | null;

  const username = typeof body?.username === "string" ? body.username : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const result = await signIn(username, password);

  if (!result.ok) {
    return Response.json(
      result.kind === "fields"
        ? { ok: false, fields: result.fields }
        : { ok: false, banner: result.message },
      { status: result.status },
    );
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, result.token, sessionCookieOptions(result.expiresAt));
  return Response.json({ ok: true });
}
